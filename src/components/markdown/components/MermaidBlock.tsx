import { useEffect, useId, useState } from 'react';
import clsx from 'clsx';
import DOMPurify from 'dompurify';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

type MermaidModule = typeof import('mermaid');

let mermaidPromise: Promise<MermaidModule> | null = null;
let mermaidConfigured = false;

const loadMermaid = async () => {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid');
  }
  const mermaid = await mermaidPromise;
  if (!mermaidConfigured) {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'strict',
    });
    mermaidConfigured = true;
  }
  return mermaid;
};

type MermaidBlockProps = {
  code: string;
  maxDiagramSizeKB: number;
};

export const MermaidBlock = ({ code, maxDiagramSizeKB }: MermaidBlockProps) => {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const diagramId = useId();
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({ rootMargin: '200px' });

  useEffect(() => {
    let cancelled = false;
    if (!isIntersecting)
      return () => {
        cancelled = true;
      };

    const sizeInKb =
      typeof TextEncoder !== 'undefined'
        ? new TextEncoder().encode(code).length / 1024
        : code.length / 1024;
    if (sizeInKb > maxDiagramSizeKB) {
      setError(`Diagram exceeds the ${maxDiagramSizeKB} KB limit (${sizeInKb.toFixed(1)} KB).`);
      return undefined;
    }

    (async () => {
      try {
        const mermaid = await loadMermaid();
        const { svg: renderedSvg } = await mermaid.render(`mermaid-${diagramId}`, code);
        if (!cancelled) {
          const sanitizedSvg = DOMPurify.sanitize(renderedSvg, {
            USE_PROFILES: { svg: true, svgFilters: true },
            ALLOWED_TAGS: ['svg', 'g', 'path', 'line', 'circle', 'rect', 'polygon', 'polyline',
              'ellipse', 'text', 'tspan', 'textPath', 'defs', 'marker', 'use', 'linearGradient',
              'radialGradient', 'stop', 'filter', 'feGaussianBlur', 'feMerge', 'feMergeNode',
              'feOffset', 'title', 'desc', 'clipPath', 'mask'],
            ALLOWED_ATTR: ['class', 'style', 'd', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r',
              'rx', 'ry', 'width', 'height', 'points', 'fill', 'stroke', 'stroke-width',
              'font-size', 'font-family', 'font-weight', 'text-anchor', 'dominant-baseline',
              'transform', 'opacity', 'href', 'xlink:href', 'id', 'viewBox', 'preserveAspectRatio'],
            FORBID_TAGS: ['a', 'script', 'image', 'foreignObject', 'iframe'],
            FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onmouseenter',
              'onmouseout', 'onkeydown', 'onkeyup', 'onkeypress', 'onsubmit', 'onchange', 'oninput',
              'onblur', 'onfocus', 'formaction'],
          });
          setSvg(sanitizedSvg);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render Mermaid diagram');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, diagramId, isIntersecting, maxDiagramSizeKB]);

  if (error) {
    return (
      <div
        ref={ref}
        className="my-6 rounded-md border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200"
        role="alert"
      >
        {error}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={clsx(
        'my-8 overflow-x-auto rounded-lg border border-white/10 bg-[#0d1016] p-4',
        svg ? 'text-white' : 'text-white/70'
      )}
      role="img"
      aria-label="Mermaid diagram"
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    >
      {!svg && <span>Rendering diagram…</span>}
    </div>
  );
};
