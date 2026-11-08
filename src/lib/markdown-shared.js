// Shared by the browser Markdown component and the build-time HTML renderer.
// Keep raw HTML sanitization and math normalization identical in both pipelines.
import { defaultSchema } from 'hast-util-sanitize';

export const markdownSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ['className', 'math-inline', 'math-display']],
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

export const normalizeMathBlocks = (source, enableMath) => {
  if (!enableMath) return source;
  const lines = source.split('\n');
  let inFence = false;
  let inMathBlock = false;
  const output = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('``')) {
      inFence = !inFence;
      output.push(line);
      continue;
    }
    if (!inFence && trimmed === '$$') {
      inMathBlock = !inMathBlock;
      output.push(line);
      continue;
    }
    if (inFence || inMathBlock) {
      output.push(line);
      continue;
    }
    if (looksLikeMathLine(trimmed)) {
      output.push('$$', trimmed, '$$');
      continue;
    }
    output.push(line);
  }
  return output.join('
');
};
