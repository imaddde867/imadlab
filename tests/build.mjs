import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { selectHomeProjects } from '../src/lib/home-projects.js';
import { renderMarkdownForStaticHtml } from '../scripts/render-markdown.js';

const projects = Array.from({ length: 35 }, (_, i) => ({
  id: `00000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`,
  title: `Synthetic ${i}`,
  featured: i < 5,
  published: true,
  created_at: '2026-01-01T00:00:00Z',
  description: 'Fixture',
  full_description: [
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
let sawPublishedProjectQuery = false;
const server = http.createServer((req, res) => {
  if (req.url.startsWith('/rest/v1/projects') && req.url.includes('published=eq.true')) {
    sawPublishedProjectQuery = true;
  }
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(req.url.startsWith('/rest/v1/projects') ? projects : req.url.startsWith('/rest/v1/posts') ? posts : []));
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
  const visibleRoot = (page) => {
    const match = page.match(/<div id="root">([\s\S]*?)<\/main>\s*<\/div>/);
    assert.ok(match, 'server-rendered root must precede the client script');
    return match[1];
  };
  const visiblePost = visibleRoot(postHtml);
  const visibleProject = visibleRoot(projectHtml);
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
  }
  assert.match(visiblePost, /<h2 id="evaluation"/);
  assert.match(visiblePost, /<table/);
  assert.match(visiblePost, /<ul/);
  assert.match(visiblePost, /<code/);
  assert.match(visiblePost, /class="hljs language-js"/);
  assert.match(postHtml, /<link rel="canonical" href="https:\/\/imadlab.com\/blogs\/synthetic-article\/"\s*\/>/);
  assert.match(postHtml, /<title>Synthetic technical article/);
  assert.match(postHtml, /<meta name="description" content="Synthetic article summary"/);
  assert.match(projectHtml, /<meta name="description" content="Fixture"/);
  assert.equal(sawPublishedProjectQuery, true, 'projects must be fetched with published=true');
  assert.match(projectHtml, /<link rel="canonical" href="https:\/\/imadlab.com\/projects\/00000000-0000-0000-0000-000000000001\/"\s*\/>/);
  assert.doesNotMatch(visiblePost, /<script|onerror=|href="javascript:/i);
  assert.match(visiblePost, /href="https:\/\/example.org\//);
  const empty = renderMarkdownForStaticHtml('');
  assert.match(empty, /article-body/);
  assert.doesNotMatch(renderMarkdownForStaticHtml('<script>alert(1)</script>'), /<script/);
  assert.match(renderMarkdownForStaticHtml('## Same\n\n## Same'), /id="same-1"/);
  console.log('PASS full visible Markdown, middle/end markers, canonical metadata and XSS fixtures');
  console.log(
    'PASS actual build, synthetic prerender/runtime agreement and complete 35-project archive'
  );
} finally {
  await Promise.all(generated.map((p, i) => writeFile(p, original[i])));
  server.close();
}
