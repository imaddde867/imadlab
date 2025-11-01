import { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { Check, Copy, ListOrdered, WrapText } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

type CodeBlockMeta = {
  title?: string;
  highlight?: Set<number>;
};

type CodeBlockProps = {
  code: string;
  language?: string;
  meta?: string;
};

type HighlightModule = typeof import('highlight.js/lib/common');

let highlighterPromise: Promise<HighlightModule['default']> | null = null;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const parseMeta = (meta?: string): CodeBlockMeta => {
  if (!meta) return {};
  const tokens = meta.match(/(?:[^\s"]+|"[^"]*")+/g) ?? [];
  const output: CodeBlockMeta = {};

  for (const token of tokens) {
    const [key, rawValue] = token.split('=');
    if (!rawValue) {
      if (key === 'highlight') {
        output.highlight = new Set();
      }
      continue;
    }
    const normalizedValue = rawValue.replace(/^"+|"+$/g, '');
    if (key === 'title') {
      output.title = normalizedValue;
    }
    if (key === 'highlight') {
      const parts = normalizedValue.split(',').map((item) => item.trim());
      const lines = new Set<number>();
      for (const part of parts) {
        if (!part) continue;
        if (part.includes('-')) {
          const [start, end] = part.split('-').map((n) => Number.parseInt(n, 10));
          if (!Number.isNaN(start) && !Number.isNaN(end)) {
            for (let line = Math.min(start, end); line <= Math.max(start, end); line += 1) {
              lines.add(line);
            }
          }
        } else {
          const single = Number.parseInt(part, 10);
          if (!Number.isNaN(single)) {
            lines.add(single);
          }
        }
      }
      if (lines.size > 0) {
        output.highlight = lines;
      }
    }
  }

  return output;
};

const loadHighlighter = async () => {
  if (!highlighterPromise) {
    highlighterPromise = import('highlight.js/lib/common').then((mod) => mod.default);
  }
  return highlighterPromise;
};

export const CodeBlock = ({ code, language, meta }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({ rootMargin: '200px' });

  const normalizedCode = useMemo(() => code.replace(/\n$/, ''), [code]);
  const lines = useMemo(() => {
    if (!normalizedCode) return [''];
    return normalizedCode.split('\n');
  }, [normalizedCode]);

  const { title, highlight } = useMemo(() => parseMeta(meta), [meta]);

  useEffect(() => {
    let cancelled = false;
    if (!isIntersecting) return () => {
      cancelled = true;
    };

    const shouldHighlight = Boolean(language && normalizedCode.length < 200000);
    if (!shouldHighlight) {
      setHighlightedHtml(null);
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      try {
        const hljs = await loadHighlighter();
        if (!hljs.getLanguage(language!)) {
          setHighlightedHtml(null);
          return;
        }
        const result = hljs.highlight(normalizedCode, { language: language! });
        if (!cancelled) {
          setHighlightedHtml(result.value);
        }
      } catch (error) {
        console.warn('Syntax highlighting failed', error);
        if (!cancelled) {
          setHighlightedHtml(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isIntersecting, language, normalizedCode]);

  const htmlLines = useMemo(() => {
    if (!highlightedHtml) {
      return lines.map((line) => escapeHtml(line));
    }
    const computed = highlightedHtml.replace(/\n$/, '').split('\n');
    if (computed.length < lines.length) {
      const gap = lines.length - computed.length;
      return [...computed, ...Array.from({ length: gap }, () => '&nbsp;')];
    }
    return computed;
  }, [highlightedHtml, lines]);

  const handleCopy = useCallback(async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(normalizedCode);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = normalizedCode;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed', error);
    }
  }, [normalizedCode]);

  const toggleWrap = useCallback(() => setWrap((value) => !value), []);
  const toggleLineNumbers = useCallback(() => setShowLineNumbers((value) => !value), []);

  const languageLabel = language ? language.toUpperCase() : 'PLAIN TEXT';

  return (
    <div
      ref={ref}
      className="my-8 overflow-hidden rounded-lg border border-white/10 bg-[#0d1016] text-sm text-white/90 shadow-lg"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/5 px-4 py-2">
        <div className="flex flex-col">
          <span className="text-xs font-semibold tracking-[0.2em] text-white/60">
            {languageLabel}
          </span>
          {title && <span className="text-xs text-white/40">{title}</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleLineNumbers}
            className={clsx(
              'flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
              showLineNumbers ? 'bg-blue-500/20 text-blue-200' : 'bg-white/10 hover:bg-white/20'
            )}
            aria-pressed={showLineNumbers}
          >
            <ListOrdered className="h-3 w-3" aria-hidden="true" />
            Lines
          </button>
          <button
            type="button"
            onClick={toggleWrap}
            className={clsx(
              'flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
              wrap ? 'bg-blue-500/20 text-blue-200' : 'bg-white/10 hover:bg-white/20'
            )}
            aria-pressed={wrap}
          >
            <WrapText className="h-3 w-3" aria-hidden="true" />
            {wrap ? 'No wrap' : 'Wrap'}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className={clsx(
              'flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
              copied ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/10 hover:bg-white/20'
            )}
            aria-live="polite"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" aria-hidden="true" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" aria-hidden="true" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
      <div
        className={clsx(
          'relative',
          wrap ? 'break-words whitespace-pre-wrap' : 'overflow-x-auto whitespace-pre'
        )}
      >
        {showLineNumbers ? (
          <div className={clsx('relative', wrap ? 'overflow-x-hidden' : 'overflow-x-auto')}>
            <table className="w-full border-collapse font-mono text-xs leading-6">
              <tbody>
                {htmlLines.map((lineHtml, index) => (
                  <tr
                    key={`line-${index + 1}`}
                    className={clsx(
                      highlight?.has(index + 1) ? 'bg-blue-500/10' : undefined,
                      'align-top'
                    )}
                  >
                    <td className="select-none whitespace-nowrap px-4 text-right text-white/30">
                      {index + 1}
                    </td>
                    <td className={clsx('px-4', wrap ? 'whitespace-pre-wrap' : 'whitespace-pre')}>
                      <code
                        className="block hljs"
                        dangerouslySetInnerHTML={{
                          __html: lineHtml === '' ? '&nbsp;' : lineHtml,
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <pre className="m-0 overflow-x-auto p-4 font-mono text-xs leading-6">
            <code
              className="block hljs"
              dangerouslySetInnerHTML={{
                __html:
                  htmlLines.join('\n') || '<span class="opacity-40 italic">Empty code block</span>',
              }}
            />
          </pre>
        )}
      </div>
    </div>
  );
};
