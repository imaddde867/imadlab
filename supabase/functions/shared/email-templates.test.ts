import { assert, assertStringIncludes } from 'https://deno.land/std@0.168.0/testing/asserts.ts';
import { generateBlogPostEmail, generateProjectEmail } from './email-templates.ts';

const siteUrl = 'https://imadlab.com';
const functionsBaseUrl = 'https://example.supabase.co/functions/v1';

const blogHtml = () =>
  generateBlogPostEmail({
    subscriberEmail: 'reader@example.com',
    unsubscribeToken: 'tok-1',
    siteUrl,
    functionsBaseUrl,
    post: {
      title: 'Quantization format and reasoning length in Mellum2.1',
      excerpt: 'Affine 4-bit and MXFP4 builds differ by 0.3 GB.',
      slug: 'quantization-format-and-reasoning-length-in-mellum2-1',
      publishedDate: '2026-10-11T00:00:00Z',
      tags: ['quantization', 'mlx'],
      imageUrl: '/images/mellum-solved-by-budget.png',
    },
  });

const projectHtml = () =>
  generateProjectEmail({
    subscriberEmail: 'reader@example.com',
    unsubscribeToken: 'tok-2',
    siteUrl,
    functionsBaseUrl,
    project: {
      title: 'Mellum2.1 on Apple Silicon',
      description: 'MLX builds measured against BF16.',
      techTags: ['mlx'],
      imageUrl: '/images/mellum-solved-by-budget.png',
      repoUrl: 'https://github.com/imaddde867/mellum-mlx',
      id: 'de4514f4-023d-43f7-8270-9b0b8723091f',
    },
  });

for (const [name, render, path] of [
  ['blog', blogHtml, '/blogs/quantization-format-and-reasoning-length-in-mellum2-1'],
  ['project', projectHtml, '/projects/de4514f4-023d-43f7-8270-9b0b8723091f'],
] as const) {
  Deno.test(`${name} email links to the live site`, () => {
    assertStringIncludes(render(), `href="${siteUrl}${path}?utm_source=newsletter`);
  });

  Deno.test(`${name} email has no stale domain or placeholder links`, () => {
    const html = render();
    assert(!html.includes('imadlab.me'), 'mentions imadlab.me');
    assert(!html.includes('yourusername'), 'has placeholder social links');
  });

  Deno.test(`${name} email unsubscribe link points at the edge function`, () => {
    assertStringIncludes(render(), `href="${functionsBaseUrl}/handle-unsubscribe?token=`);
  });

  Deno.test(`${name} email resolves a relative cover image against the site`, () => {
    assertStringIncludes(render(), `src="${siteUrl}/images/mellum-solved-by-budget.png"`);
  });
}
