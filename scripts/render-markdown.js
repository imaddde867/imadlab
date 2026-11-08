// Static-only Markdown rendering. The browser replaces this subtree using createRoot.
// ReactMarkdown's URL handling and the shared rehype sanitizer protect untrusted content.
import React, { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkGithub from 'remark-github';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeKatex from 'rehype-katex';
import GithubSlugger from 'github-slugger';
import hljs from 'highlight.js/lib/common';
import { markdownSanitizeSchema, normalizeMathBlocks } from '../src/lib/markdown-shared.js';

const getText = (node) => {
  if (!node) return '';
  if (typeof node.value === 'string') return node.value;
  return Array.isArray(node.children) ? node.children.map(getText).join('') : '';
};

const repositorySlugFor = (repositoryUrl) => {
  try {
    const url = new URL(repositoryUrl);
    if (url.hostname !== 'github.com') return undefined;
    const [, owner, name] = url.pathname.split('/');
    return owner && name ? `${owner}/${name.replace(/\.git$/i, '')}` : undefined;
  } catch {
    return undefined;
  }
};

export const renderMarkdownForStaticHtml = (markdown, { repositoryUrl } = {}) => {
  if (typeof markdown !== 'string') throw new TypeError('Markdown source must be a string');
  const slugger = new GithubSlugger();
  const slug = repositorySlugFor(repositoryUrl);
  const remarkPlugins = [remarkGfm, remarkMath];
  if (slug) remarkPlugins.push([remarkGithub, { repository: slug }]);
  const heading = (level) => ({ node, children }) => {
    const id = slugger.slug(getText(node));
    return createElement(`h${level}`, { id, className: 'group relative scroll-mt-24' }, children);
  };
  const components = {
    h1: heading(1), h2: heading(2), h3: heading(3),
    h4: heading(4), h5: heading(5), h6: heading(6),
    pre: ({ children }) => children,
    code: ({ className, children }) => {
      const raw = String(children ?? '');
      const isBlock = /language-/.test(className ?? '') || raw.endsWith('\n');
      if (!isBlock) return createElement('code', null, children);
      const code = raw.replace(/\n$/, '');
      const language = /^language-([^\s]+)/.exec(className ?? '')?.[1]?.toLowerCase();
      if (language === 'mermaid') {
        return createElement('pre', { className: 'md-block overflow-x-auto', 'data-mermaid-source': 'true' },
          createElement('code', { className: 'language-mermaid' }, code));
      }
      // KaTeX is rendered by rehypeKatex for $...$ and $$...$$.
      // Preserve fenced math source for clients that do not run JavaScript.
      const highlighted = language && code.length < 200000 && hljs.getLanguage(language)
        ? hljs.highlight(code, { language }).value : null;
      return createElement('pre', { className: 'md-block overflow-x-auto rounded-md border border-white/10 p-4' },
        highlighted
          ? createElement('code', { className: `hljs language-${language}`, dangerouslySetInnerHTML: { __html: highlighted } })
          : createElement('code', { className: language ? `language-${language}` : undefined }, code));
    },
  };
  const content = createElement(ReactMarkdown, {
    remarkPlugins,
    rehypePlugins: [rehypeRaw, [rehypeSanitize, markdownSanitizeSchema], rehypeKatex],
    components,
  }, normalizeMathBlocks(markdown, true));
  return renderToStaticMarkup(createElement('section', { className: 'article-body' }, content));
};
