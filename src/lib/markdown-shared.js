// Shared by the browser Markdown component and the build-time HTML renderer.
// Keep raw HTML sanitization and math normalization identical in both pipelines.
import { defaultSchema } from 'hast-util-sanitize';

export const markdownSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ['className', /^language-[a-zA-Z0-9_+-]+$/, 'math-inline', 'math-display']],
    details: [...(defaultSchema.attributes?.details ?? []), 'open'],
    video: [
      ...(defaultSchema.attributes?.video ?? []),
      'src', 'controls', 'autoplay', 'loop', 'muted', 'playsInline',
      'poster', 'preload', 'height', 'width',
    ],
    source: [...(defaultSchema.attributes?.source ?? []), 'src', 'type'],
    audio: [
      ...(defaultSchema.attributes?.audio ?? []),
      'controls', 'autoplay', 'loop', 'muted', 'preload',
    ],
    track: ['default', 'kind', 'label', 'srcLang', 'src'],
    figure: [...(defaultSchema.attributes?.figure ?? []), 'role'],
    figcaption: defaultSchema.attributes?.figcaption ?? [],
  },
  tagNames: Array.from(new Set([
    ...(defaultSchema.tagNames ?? []),
    'details', 'summary', 'figure', 'figcaption', 'video', 'audio', 'track',
  ])),
  protocols: {
    ...defaultSchema.protocols,
    src: ['http', 'https', 'data'],
    poster: ['http', 'https'],
  },
};

const looksLikeMathLine = (line) => line.startsWith('\\') && /\\[A-Za-z]+/.test(line);

// Normalization must not interpret LaTeX commands inside fenced or indented code.
// CommonMark fences may use backticks or tildes, with a closing run at least as long.
export const normalizeMathBlocks = (source, enableMath) => {
  if (!enableMath) return source;
  const lines = source.split('\n');
  let fence = null;
  let inMathBlock = false;
  const output = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const match = /^ {0,3}(\x60{3,}|~{3,})(.*)$/.exec(line);

    if (fence) {
      if (match && match[1][0] === fence.marker &&
          match[1].length >= fence.length && !match[2].trim()) {
        fence = null;
      }
      output.push(line);
      continue;
    }
    if (inMathBlock) {
      if (trimmed === '$$') inMathBlock = false;
      output.push(line);
      continue;
    }
    if (match && (match[1][0] === '~' || !match[2].includes('\x60'))) {
      fence = { marker: match[1][0], length: match[1].length };
      output.push(line);
      continue;
    }
    if (trimmed === '$$') {
      inMathBlock = true;
      output.push(line);
      continue;
    }
    if (/^(?: {4}|\t)/.test(line)) {
      output.push(line);
      continue;
    }
    if (looksLikeMathLine(trimmed)) {
      output.push('$$', trimmed, '$$');
      continue;
    }
    output.push(line);
  }
  return output.join('\n');
};

/** Consistent published project body for build-time HTML and the React detail page. */
export const selectProjectMarkdown = (project) => {
  const full = typeof project?.full_description === 'string' ? project.full_description : '';
  if (full.trim()) return full;
  const short = typeof project?.description === 'string' ? project.description : '';
  return short.trim() ? short : '';
};

/** Classify video Markdown media consistently in static and client renderers. */
export const resolveMediaType = (src) => {
  if (typeof src !== 'string') return 'image';
  const pathname = src.split(/[?#]/, 1)[0].toLowerCase();
  return /\.(mp4|webm|ogg|mov)$/.test(pathname) ? 'video' : 'image';
};

/**
 * Recognize paragraphs made entirely of Markdown images, including images
 * wrapped in links. All other images must remain phrasing content inside <p>.
 */
export const isStandaloneMediaParagraph = (node) => {
  const meaningfulChildren = (children) =>
    (children ?? []).filter((child) => child.type !== 'text' || Boolean(child.value?.trim()));
  const isImage = (child) => {
    if (child.type !== 'element') return false;
    if (child.tagName === 'img') return true;
    if (child.tagName !== 'a') return false;
    const linked = meaningfulChildren(child.children);
    return linked.length === 1 && linked[0].type === 'element' && linked[0].tagName === 'img';
  };
  const children = meaningfulChildren(node?.children);
  return children.length > 0 && children.every(isImage);
};
