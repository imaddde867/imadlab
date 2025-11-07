import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

type MathRendererProps = {
  value: string;
  inline?: boolean;
};

type KatexModule = typeof import('katex');

let katexPromise: Promise<KatexModule> | null = null;

const loadKatex = async () => {
  if (!katexPromise) {
    katexPromise = Promise.all([import('katex/dist/katex.min.css'), import('katex')]).then(
      ([, katex]) => katex
    );
  }
  return katexPromise;
};

export const MathRenderer = ({ value, inline = false }: MathRendererProps) => {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLSpanElement>({ rootMargin: '200px' });
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!isIntersecting)
      return () => {
        cancelled = true;
      };

    (async () => {
      try {
        const katex = await loadKatex();
        const rendered = katex.renderToString(value, {
          displayMode: !inline,
          throwOnError: false,
          trust: false,
          output: 'html',
        });
        if (!cancelled) {
          setHtml(rendered);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Math rendering failed');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [inline, isIntersecting, value]);

  if (error) {
    return (
      <span
        ref={ref}
        className="rounded-md bg-red-500/20 px-2 py-1 font-mono text-xs text-red-200"
        role="alert"
      >
        {error}
      </span>
    );
  }

  return (
    <span
      ref={ref}
      className={clsx(
        inline
          ? 'mx-1 inline-block align-middle text-white'
          : 'my-6 block overflow-x-auto text-center text-lg text-white'
      )}
      role="math"
      aria-label={value}
      dangerouslySetInnerHTML={html ? { __html: html } : undefined}
    >
      {!html && (
        <span className="rounded-md bg-white/10 px-2 py-1 font-mono text-xs text-white/70">
          {value}
        </span>
      )}
    </span>
  );
};
