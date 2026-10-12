const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Accepts absolute http(s) URLs, and resolves site-relative paths (e.g. "/images/x.png")
// against the site, so cover images stored as relative paths still work in email.
const safeUrl = (value: string | undefined | null, base?: string): string | null => {
  if (!value) return null;
  try {
    const url = base ? new URL(value, base) : new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return escapeHtml(url.toString());
  } catch {
    return null;
  }
};

const withUTM = (url: string, campaign: string) => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}utm_source=newsletter&utm_medium=email&utm_campaign=${campaign}`;
};

// Unsubscribe is an edge function, so it lives on the Supabase functions host, not the site.
const buildUnsubscribeUrl = (functionsBaseUrl: string, token: string): string | null => {
  try {
    const url = new URL(`${functionsBaseUrl.replace(/\/$/, '')}/handle-unsubscribe`);
    url.searchParams.set('token', token);
    return safeUrl(url.toString());
  } catch {
    return null;
  }
};

// Light palette taken from the site's Night Desk theme pair; dark email backgrounds get
// inverted unpredictably by mail clients, so email stays light.
const C = {
  page: '#f6f3ec',
  text: '#1f1d1a',
  muted: '#6b665c',
  line: '#e2ddd1',
  link: '#9a5f12',
};
const SERIF = "Literata, Georgia, 'Times New Roman', serif";
const SANS = "'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";

const SOCIALS = [
  ['GitHub', 'https://github.com/imaddde867'],
  ['LinkedIn', 'https://www.linkedin.com/in/imad-eddine-e-986741262'],
] as const;

export interface BlogPostEmailData {
  subscriberEmail: string;
  unsubscribeToken: string;
  post: {
    title: string;
    excerpt?: string;
    slug: string;
    publishedDate: string;
    tags: string[];
    imageUrl?: string;
  };
  siteUrl: string;
  functionsBaseUrl: string;
}

export interface ProjectEmailData {
  subscriberEmail: string;
  unsubscribeToken: string;
  project: {
    title: string;
    description: string;
    techTags: string[];
    imageUrl?: string;
    repoUrl?: string;
    id: string;
  };
  siteUrl: string;
  functionsBaseUrl: string;
}

type Layout = {
  siteUrl: string;
  kicker: string;
  title: string;
  date?: string;
  summary: string;
  meta?: string;
  imageUrl: string | null;
  primary: { href: string | null; label: string };
  secondary?: { href: string | null; label: string };
  unsubscribeUrl: string | null;
};

const render = (l: Layout) => {
  const site = escapeHtml(l.siteUrl);
  const link = (href: string | null, label: string) =>
    href
      ? `<a href="${href}" style="color:${C.link};text-decoration:underline;font-weight:600;">${label}</a>`
      : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<title>${l.title}</title>
</head>
<body style="margin:0;padding:0;background:${C.page};color:${C.text};font-family:${SANS};-webkit-text-size-adjust:none;">
<span style="display:none;max-height:0;overflow:hidden;">${l.summary}</span>
<div style="max-width:560px;margin:0 auto;padding:40px 24px;">
  <p style="margin:0 0 32px;font-family:${SERIF};font-size:17px;font-weight:600;">
    <a href="${site}" style="color:${C.text};text-decoration:none;">Imad Eddine El Mouss</a>
  </p>
  <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${C.muted};">${l.kicker}${l.date ? ` · ${l.date}` : ''}</p>
  <h1 style="margin:0 0 16px;font-family:${SERIF};font-size:26px;line-height:1.25;font-weight:600;color:${C.text};">${l.title}</h1>
  <p style="margin:0 0 20px;font-size:16px;line-height:1.65;color:${C.text};">${l.summary}</p>
  ${l.imageUrl && l.primary.href ? `<a href="${l.primary.href}"><img src="${l.imageUrl}" alt="${l.title}" width="512" style="display:block;width:100%;max-width:512px;height:auto;border:1px solid ${C.line};border-radius:4px;margin:0 0 20px;"></a>` : ''}
  ${l.meta ? `<p style="margin:0 0 24px;font-size:13px;color:${C.muted};">${l.meta}</p>` : ''}
  <p style="margin:0 0 40px;font-size:16px;">
    ${link(l.primary.href, l.primary.label)}${l.secondary?.href ? `&nbsp;&nbsp;·&nbsp;&nbsp;${link(l.secondary.href, l.secondary.label)}` : ''}
  </p>
  <p style="margin:0;padding-top:20px;border-top:1px solid ${C.line};font-size:12px;line-height:1.6;color:${C.muted};">
    You receive this because you subscribed at <a href="${site}" style="color:${C.muted};">imadlab.com</a>.
    ${SOCIALS.map(([name, url]) => `<a href="${url}" style="color:${C.muted};">${name}</a>`).join(' · ')}${l.unsubscribeUrl ? ` · <a href="${l.unsubscribeUrl}" style="color:${C.muted};">Unsubscribe</a>` : ''}
  </p>
</div>
</body>
</html>`;
};

export function generateBlogPostEmail(data: BlogPostEmailData): string {
  const { post, siteUrl, functionsBaseUrl, unsubscribeToken } = data;
  const postUrl = safeUrl(withUTM(`${siteUrl}/blogs/${post.slug}`, 'blog_post'));
  return render({
    siteUrl,
    kicker: 'New writing',
    title: escapeHtml(post.title),
    date: new Date(post.publishedDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    summary: escapeHtml(post.excerpt || post.title),
    meta: post.tags?.length ? post.tags.map(escapeHtml).join(', ') : undefined,
    imageUrl: safeUrl(post.imageUrl, siteUrl),
    primary: { href: postUrl, label: 'Read the post' },
    unsubscribeUrl: buildUnsubscribeUrl(functionsBaseUrl, unsubscribeToken),
  });
}

export function generateProjectEmail(data: ProjectEmailData): string {
  const { project, siteUrl, functionsBaseUrl, unsubscribeToken } = data;
  const projectUrl = safeUrl(withUTM(`${siteUrl}/projects/${project.id}`, 'new_project'));
  const repoUrl = project.repoUrl ? safeUrl(withUTM(project.repoUrl, 'new_project_repo')) : null;
  return render({
    siteUrl,
    kicker: 'New project',
    title: escapeHtml(project.title),
    summary: escapeHtml(project.description || project.title),
    meta: project.techTags?.length ? project.techTags.map(escapeHtml).join(', ') : undefined,
    imageUrl: safeUrl(project.imageUrl, siteUrl),
    primary: { href: projectUrl, label: 'View the project' },
    secondary: repoUrl ? { href: repoUrl, label: 'Source code' } : undefined,
    unsubscribeUrl: buildUnsubscribeUrl(functionsBaseUrl, unsubscribeToken),
  });
}
