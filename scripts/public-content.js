import { readFile } from 'node:fs/promises';
import { createSupabaseClient, SUPABASE_URL } from './utils/supabase.js';
import { SITE_URL } from './utils/site.js';

export const INVENTORY_FILE = new URL('../.cache/public-content.json', import.meta.url);
export const STATIC_ROUTES = ['/', '/projects/', '/blogs/', '/tags/', '/extras/'];
export const PAGE_SIZE = 250;
const SAFE_SEGMENT = /^[a-zA-Z0-9_-]+$/;

export const isSafeSegment = (value) =>
  typeof value === 'string' && SAFE_SEGMENT.test(value) && value.length > 0;

export const tagSlug = (value) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');


export const resolvePublicImageUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) return null;
  const trimmed = value.trim();
  if (/^\/?public\//.test(trimmed)) return '/' + trimmed.replace(/^\/?public\//, '');
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/')) return trimmed;
  if (SUPABASE_URL && trimmed.startsWith('storage/')) {
    return SUPABASE_URL.replace(/\/$/, '') + '/' + trimmed;
  }
  return '/' + trimmed;
};

export const toAbsolutePublicImageUrl = (value) => {
  const resolved = resolvePublicImageUrl(value);
  if (!resolved || /^(data:|blob:)/i.test(resolved)) return null;
  try {
    const url = new URL(resolved, SITE_URL);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
};

const isoDate = (value, label) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('Missing date for ' + label);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date for ' + label + ': ' + value);
  }
  return date.toISOString().slice(0, 10);
};

// Use stable secondary ID ordering and a page size smaller than the PostgREST row cap.
// Fail rather than silently treating a failed request as an empty result.
async function fetchPages(client, table, fields, pageSize) {
  const rows = [];
  for (let offset = 0; ; offset += pageSize) {
    let query = client.from(table).select(fields);
    if (table === 'projects') {
      query = query.eq('published', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .order('id', { ascending: true });
    } else {
      query = query.order('published_date', { ascending: false })
        .order('id', { ascending: true });
    }
    const { data, error } = await query.range(offset, offset + pageSize - 1);
    if (error) throw new Error('Failed to fetch ' + table + ' at offset ' + offset + ': ' + (error.message || String(error)));
    if (!Array.isArray(data)) throw new Error('Invalid ' + table + ' response at offset ' + offset);
    if (data.length > pageSize) throw new Error('Unbounded ' + table + ' page at offset ' + offset);
    rows.push(...data);
    if (data.length < pageSize) return rows;
  }
}

export function buildPublicContentInventory(posts, projects) {
  if (!Array.isArray(posts) || !Array.isArray(projects)) {
    throw new Error('Public content must contain post and project arrays');
  }
  const routes = STATIC_ROUTES.map((route) => ({ route }));
  const routeSet = new Set(STATIC_ROUTES);
  const ensureRoute = (route) => {
    if (routeSet.has(route)) throw new Error('Duplicate public route: ' + route);
    routeSet.add(route);
  };
  const safePosts = [];
  const safeProjects = [];
  const tags = new Map();

  const addTags = (values) => {
    if (!Array.isArray(values)) return;
    for (const value of values) {
      if (typeof value !== 'string' || !value.trim()) continue;
      const slug = tagSlug(value);
      if (isSafeSegment(slug) && !tags.has(slug)) tags.set(slug, value.trim());
    }
  };

  for (const post of posts) {
    if (!post || !isSafeSegment(post.slug)) {
      throw new Error('Unsafe or missing blog slug: ' + String(post?.slug));
    }
    if (typeof post.title !== 'string' || !post.title.trim()) {
      throw new Error('Missing blog title for ' + post.slug);
    }
    const route = '/blogs/' + post.slug + '/';
    ensureRoute(route);
    const lastmod = isoDate(post.updated_at || post.published_date, route);
    isoDate(post.published_date, route + ' published_date');
    safePosts.push(post);
    routes.push({ route, lastmod, image_url: post.image_url });
    addTags(post.tags);
  }

  // Enforce publication rules even if anonymous RLS is changed.
  for (const project of projects) {
    if (project?.published !== true) continue;
    if (!isSafeSegment(project.id)) {
      throw new Error('Unsafe or missing project ID: ' + String(project?.id));
    }
    if (typeof project.title !== 'string' || !project.title.trim()) {
      throw new Error('Missing project title for ' + project.id);
    }
    const route = '/projects/' + project.id + '/';
    ensureRoute(route);
    const lastmod = isoDate(project.updated_at || project.created_at, route);
    isoDate(project.created_at, route + ' created_at');
    safeProjects.push(project);
    routes.push({ route, lastmod, image_url: project.image_url });
    addTags(project.tech_tags);
  }

  const tagEntries = [...tags].map(([slug, label]) => ({ slug, label }));
  for (const { slug } of tagEntries) {
    const route = '/tags/' + slug + '/';
    ensureRoute(route);
    routes.push({ route });
  }

  return { version: 1, posts: safePosts, projects: safeProjects, tags: tagEntries, routes };
}

export async function fetchPublicContent(client = createSupabaseClient(), { pageSize = PAGE_SIZE } = {}) {
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 1000) {
    throw new Error('pageSize must be an integer from 1 to 1000');
  }
  const posts = await fetchPages(
    client, 'posts', 'id,title,slug,excerpt,body,tags,published_date,updated_at,read_time,image_url', pageSize
  );
  const projects = await fetchPages(
    client, 'projects',
    'id,title,description,full_description,tech_tags,created_at,updated_at,image_url,repo_url,demo_url,featured,published',
    pageSize
  );
  return buildPublicContentInventory(posts, projects);
}

export async function readPublicContent() {
  const inventory = JSON.parse(await readFile(INVENTORY_FILE, 'utf8'));
  if (inventory?.version !== 1 ||
      !Array.isArray(inventory.posts) ||
      !Array.isArray(inventory.projects) ||
      !Array.isArray(inventory.tags) ||
      !Array.isArray(inventory.routes)) {
    throw new Error('Invalid generated public-content inventory');
  }
  return inventory;
}
