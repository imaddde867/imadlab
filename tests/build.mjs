import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { selectHomeProjects } from '../src/lib/home-projects.js';
import { renderMarkdownForStaticHtml } from '../scripts/render-markdown.js';
import { selectProjectMarkdown, normalizeMathBlocks, resolveMediaType } from '../src/lib/markdown-shared.js';

const projects = Array.from({ length: 35 }, (_, i) => ({
  id: `00000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`,
  title: `Synthetic ${i}`,
  featured: i < 5,
  published: true,
  created_at: '2026-01-01T00:00:00Z',
  description: i === 1 ? 'FALLBACK_PROJECT_DESCRIPTION_MARKER with **bold** text' : i === 2 ? null : 'Fixture',
  full_description: i === 1 || i === 2 ? null : [
    '# Project methods',
    'PROJECT_BEGIN_MARKER',
    'A'.repeat(700),
    '## Project validation',
    'PROJECT_MIDDLE_MARKER',
    'Project inline math: $a^2 + b^2 = c^2$.',
    '$$\n\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}\n$$',
    '| Metric | Value |\n| --- | --- |\n| Accuracy | 0.95 |',
    'PROJECT_END_MARKER',
  ].join('\n\n'),
  tech_tags: [],
})).reverse();
const postBody = [
  '# Research overview',
  'POST_BEGIN_MARKER',
  'B'.repeat(800),
  '## Evaluation',
  'POST_MIDDLE_MARKER',
  'Inline formula $E = mc^2$.',
  '$$\n\\int_0^1 x^2\\,dx = \\frac{1}{3}\n$$',
  '- First check',
  '- Second check',
  '~~~js',
  'const safe = 42;',
  '~~~',
  '~~~latex',
  'x^2 + y^2',
  '~~~',
  '![Recorded demonstration](https://example.org/demo.mp4)',
  '![Signed demonstration](https://example.org/demo.mp4?token=fixture#t=1)',
  '~~~text\n\\alpha + \\beta\n~~~',
  'Before ![inline icon](/icon.svg) after',
  'Before [![linked icon](/icon.svg)](https://example.org/icon) after',
  '![Standalone icon](/icon.svg "Standalone caption")',
  '[![Standalone linked icon](/icon.svg "Linked caption")](https://example.org/linked-icon)',
  '| Result | Status |\n| --- | --- |\n| Test | Passed |',
  '## Conclusions',
  'POST_END_MARKER',
  '<script>alert("danger")</script>',
  '<img src="x" onerror="alert(1)">',
  '[unsafe](javascript:alert(1))',
  '[safe](https://example.org/)',
].join('\n\n');
const posts = [{
  id: '00000000-0000-0000-0000-000000009999',
  slug: 'synthetic-article',
  title: 'Synthetic technical article',
  excerpt: 'Synthetic article summary',
  body: postBody,
  published_date: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z',
  tags: ['Research'],
  read_time: 5,
  image_url: null,
}];
const draftProject = { ...projects[0], id: '00000000-0000-0000-0000-00000000dead', title: 'Unpublished draft', published: false };
let sawPublishedProjectQuery = false;
const server = http.createServer((req, res) => {
  if (req.url.startsWith('/rest/v1/projects') && req.url.includes('published=eq.true')) {
    sawPublishedProjectQuery = true;
  }
  res.setHeader('content-type', 'application/json');
  const projectRows = req.url.includes('published=eq.true') ? projects : [...projects, draftProject];
  res.end(JSON.stringify(req.url.startsWith('/rest/v1/projects') ? projectRows : req.url.startsWith('/rest/v1/posts') ? posts : []));
});
await new Promise((resolve) => server.listen(55440, '127.0.0.1', resolve));
const generated = ['public/sitemap.xml', 'public/feed.xml', 'public/feed.json'];
const original = await Promise.all(generated.map((p) => readFile(p)));
try {
  const child = spawn('npm', ['run', 'build'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      SUPABASE_URL: 'http://127.0.0.1:55440',
      SUPABASE_ANON_KEY: 'synthetic',
      SUPABASE_DEPLOY: '0',
    },
  });
  const code = await new Promise((resolve) => child.on('exit', resolve));
  assert.equal(code, 0, 'actual npm build');
  const html = await readFile('dist/index.html', 'utf8');
  const section = html.match(/<h2>Research and projects<\/h2>([\s\S]*?)<\/section>/)[1];
  const ids = [...section.matchAll(/href="\/projects\/([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(
    ids,
    selectHomeProjects(projects).map((p) => p.id)
  );
  assert.match(html, /window\.__PRERENDERED_DATA__\["projects"\]/);
  const archive = await readFile('dist/projects/index.html', 'utf8');
  for (const project of projects) assert.ok(archive.includes(project.id), 'complete archive');
  const postHtml = await readFile('dist/blogs/synthetic-article/index.html', 'utf8');
  const projectHtml = await readFile('dist/projects/00000000-0000-0000-0000-000000000001/index.html', 'utf8');
  const fallbackProjectHtml = await readFile('dist/projects/00000000-0000-0000-0000-000000000002/index.html', 'utf8');
  const emptyProjectHtml = await readFile('dist/projects/00000000-0000-0000-0000-000000000003/index.html', 'utf8');
  const visibleRoot = (page) => {
    const match = page.match(/<div id="root">([\s\S]*?)<\/main>\s*<\/div>/);
    assert.ok(match, 'server-rendered root must precede the client script');
    return match[1];
  };
  const visiblePost = visibleRoot(postHtml);
  const visibleProject = visibleRoot(projectHtml);
  const visibleFallback = visibleRoot(fallbackProjectHtml);
  const visibleEmpty = visibleRoot(emptyProjectHtml);
  assert.match(visibleFallback, /FALLBACK_PROJECT_DESCRIPTION_MARKER/);
  assert.match(visibleFallback, /<strong>bold<\/strong>/);
  assert.doesNotMatch(visibleFallback, /No detailed description available/);
  assert.match(visibleEmpty, /No detailed description available for this project/);
  assert.equal(selectProjectMarkdown({ full_description: '  ', description: '**Fallback**' }), '**Fallback**');
  assert.equal(selectProjectMarkdown({ full_description: null, description: null }), '');
  assert.equal(selectProjectMarkdown({ full_description: 'Full', description: 'Short' }), 'Full');
  const tildeFence = '~~~text\n\\alpha + \\beta\n~~~';
  assert.equal(normalizeMathBlocks(tildeFence, true), tildeFence,
    'math normalization must not rewrite code inside tilde fences');
  const ticks = String.fromCharCode(96);
  const longFence = [ticks.repeat(4) + 'text', ticks.repeat(3), '\\alpha', ticks.repeat(4)].join('\n');
  assert.equal(normalizeMathBlocks(longFence, true), longFence,
    'a shorter backtick run must not close a longer fence');
  assert.equal(normalizeMathBlocks('    \\alpha', true), '    \\alpha',
    'indented code must not be rewritten as math');
  assert.equal(resolveMediaType('demo.mp4?token=x#t=1'), 'video');
  assert.equal(resolveMediaType('demo.MP4#t=1'), 'video');
  assert.equal(resolveMediaType('icon.svg?file=demo.mp4'), 'image');
  for (const marker of ['POST_BEGIN_MARKER', 'POST_MIDDLE_MARKER', 'POST_END_MARKER']) {
    assert.ok(visiblePost.includes(marker), `visible article content missing: ${marker}`);
  }
  for (const marker of ['PROJECT_BEGIN_MARKER', 'PROJECT_MIDDLE_MARKER', 'PROJECT_END_MARKER']) {
    assert.ok(visibleProject.includes(marker), `visible project content missing: ${marker}`);
  }
  // KaTeX is generated server-side; its CSS must also be linked in the HTML,
  // not deferred to the lazy Markdown component and a JavaScript-loaded CSS chunk.
  for (const [label, page, visible] of [
    ['post', postHtml, visiblePost],
    ['project', projectHtml, visibleProject],
  ]) {
    assert.match(visible, /class="katex"/, label + ': missing prerendered inline math');
    assert.match(visible, /class="katex-display"/, label + ': missing prerendered display math');
    assert.match(visible, /class="katex-mathml"/, label + ': missing accessible MathML');
    const cssPaths = [...page.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="(\/assets\/[^"]+\.css)"/g)]
      .map((match) => match[1]);
    assert.ok(cssPaths.length > 0, label + ': no stylesheet linked without JavaScript');
    const css = (await Promise.all(cssPaths.map((href) => readFile('dist' + href, 'utf8')))).join('\n');
    assert.match(css, /\.katex\s*\{/, label + ': linked CSS lacks KaTeX layout rules');
    assert.match(css, /\.katex-display\s*\{/, label + ': linked CSS lacks display math rules');
    assert.match(css, /\.katex\s+\.katex-mathml\s*\{/, label + ': linked CSS must hide duplicate MathML');
    for (const tokenClass of ['.hljs-keyword,', '.hljs-number,', '.hljs-string,']) {
      assert.ok(css.includes(tokenClass), label + ': generated CSS must retain ' + tokenClass);
    }
    // These static HTML selectors are not visible to Tailwind's TSX scan.
    for (const selector of [
      '.prerender-shell{',
      '.prerender-link,',
      '.prerender-content .article-body a{',
      '.prerender-content .article-body ul{',
      '.prerender-content .article-body ol{',
      '.prerender-content .article-body .prerender-table{',
    ]) {
      assert.ok(css.includes(selector), label + ': missing no-JS style ' + selector);
    }
  }
  assert.match(visiblePost, /<h2 id="evaluation"/);
  assert.match(visiblePost, /<table/);
  assert.match(visiblePost, /<ul/);
  assert.match(visiblePost, /<code/);
  assert.match(visiblePost, /class="hljs language-js"/);
  assert.match(visiblePost, /class="prerender-table"/);
  assert.match(visiblePost, /class="md-block prerender-math"/, 'fenced LaTeX must render as KaTeX HTML');
  assert.match(visiblePost, /<video[^>]*src="https:\/\/example.org\/demo\.mp4"/);
  assert.match(visiblePost, /<video[^>]*src="https:\/\/example\.org\/demo\.mp4\?token=fixture#t=1"/,
    'signed video URLs with queries/fragments must prerender as video');
  assert.doesNotMatch(visiblePost, /<img[^>]*src="https:\/\/example\.org\/demo\.mp4\?/);
  assert.doesNotMatch(visiblePost, /<img[^>]*src="https:\/\/example.org\/demo\.mp4"/);
  assert.doesNotMatch(visiblePost, /<p\b[^>]*>(?:(?!<\/p>)[\s\S])*<figure\b/,
    'figures must never appear inside HTML paragraphs');
  const inlineImage = renderMarkdownForStaticHtml('Before ![icon](/icon.svg) after');
  assert.match(inlineImage, /<p>Before <img\b[^>]*src="\/icon\.svg"[^>]*\/> after<\/p>/,
    'an inline image must stay inside its paragraph');
  const inlineLinkImage = renderMarkdownForStaticHtml(
    'Before [![icon](/icon.svg)](https://example.org/icon) after');
  assert.match(inlineLinkImage,
    /<p>Before <a\b[^>]*href="https:\/\/example\.org\/icon"[^>]*><img\b[^>]*src="\/icon\.svg"[^>]*\/><\/a> after<\/p>/,
    'a linked inline image must stay inside its paragraph');
  const standaloneImage = renderMarkdownForStaticHtml('![icon](/icon.svg "Caption")');
  assert.match(standaloneImage,
    /<figure class="md-block prerender-media"><img\b[^>]*\/><figcaption>Caption<\/figcaption><\/figure>/,
    'standalone images must retain a block figure and caption');
  const standaloneLinkedImage = renderMarkdownForStaticHtml(
    '[![icon](/icon.svg "Linked caption")](https://example.org/icon)');
  assert.match(standaloneLinkedImage,
    /<a\b[^>]*href="https:\/\/example\.org\/icon"[^>]*><figure class="md-block prerender-media"><img\b[^>]*\/><figcaption>Linked caption<\/figcaption><\/figure><\/a>/,
    'standalone linked images must not be enclosed by paragraphs');
  assert.match(visiblePost, /<p>Before <img\b[^>]*alt="inline icon"[^>]*\/> after<\/p>/);
  assert.match(visiblePost, /<p>Before <a\b[^>]*href="https:\/\/example\.org\/icon"[^>]*><img\b[^>]*alt="linked icon"[^>]*\/><\/a> after<\/p>/);
  assert.match(postHtml, /<link rel="canonical" href="https:\/\/imadlab.com\/blogs\/synthetic-article\/"\s*\/>/);
  assert.match(postHtml, /<title>Synthetic technical article \| Imadlab<\/title>/);
  assert.doesNotMatch(postHtml, /Data and AI Engineer|name="keywords"|SoftwareApplication|"offers"/);
  assert.equal((postHtml.match(/rel="canonical"/g) || []).length, 1);
  assert.doesNotMatch(projectHtml, /SoftwareApplication|"offers"/);
  assert.match(postHtml, /<meta name="description" content="Synthetic article summary"/);
  assert.match(projectHtml, /<meta name="description" content="Fixture"/);
  const sitemap = await readFile('public/sitemap.xml', 'utf8');
  assert.ok(sitemap.includes(projects[0].id), 'sitemap lists published projects');
  assert.ok(!sitemap.includes(draftProject.id), 'sitemap must not list unpublished projects');
  assert.equal(sawPublishedProjectQuery, true, 'projects must be fetched with published=true');
  assert.match(projectHtml, /<link rel="canonical" href="https:\/\/imadlab.com\/projects\/00000000-0000-0000-0000-000000000001\/"\s*\/>/);
  assert.doesNotMatch(visiblePost, /<script|onerror=|href="javascript:/i);
  assert.match(visiblePost, /href="https:\/\/example.org\//);
  const empty = renderMarkdownForStaticHtml('');
  assert.match(empty, /article-body/);
  assert.doesNotMatch(renderMarkdownForStaticHtml('<script>alert(1)</script>'), /<script/);
  assert.match(renderMarkdownForStaticHtml('## Same\n\n## Same'), /id="same-1"/);
  console.log('PASS full visible Markdown, no-JS styles, media/math parity, fallback content and XSS fixtures');
  console.log(
    'PASS actual build, synthetic prerender/runtime agreement and complete 35-project archive'
  );
} finally {
  await Promise.all(generated.map((p, i) => writeFile(p, original[i])));
  server.close();
}
