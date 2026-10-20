import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { selectHomeProjects } from '../src/lib/home-projects.js';

const projects = Array.from({ length: 35 }, (_, i) => ({
  id: `00000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`,
  title: `Synthetic ${i}`,
  featured: i < 5,
  published: true,
  created_at: '2026-01-01T00:00:00Z',
  description: 'Fixture',
  full_description: 'Fixture',
  tech_tags: [],
})).reverse();
const server = http.createServer((req, res) => {
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(req.url.startsWith('/rest/v1/projects') ? projects : []));
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
  console.log(
    'PASS actual build, synthetic prerender/runtime agreement and complete 35-project archive'
  );
} finally {
  await Promise.all(generated.map((p, i) => writeFile(p, original[i])));
  server.close();
}
