// PROTOTYPE (throwaway): floating variant switcher, dev builds only.
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

type Props = { variants: { key: string; name: string }[]; current: string };

const PrototypeSwitcher = ({ variants, current }: Props) => {
  const [params, setParams] = useSearchParams();
  const index = Math.max(
    0,
    variants.findIndex((v) => v.key === current)
  );

  const go = (step: number) => {
    const next = variants[(index + step + variants.length) % variants.length];
    const p = new URLSearchParams(params);
    p.set('variant', next.key);
    setParams(p, { replace: true });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest('input, textarea, [contenteditable="true"]')) return;
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 rounded-full bg-yellow-300 px-4 py-2 font-mono text-sm text-black shadow-2xl">
      <button onClick={() => go(-1)} aria-label="Previous variant">
        ←
      </button>
      <span>
        {variants[index].key} · {variants[index].name}
      </span>
      <button onClick={() => go(1)} aria-label="Next variant">
        →
      </button>
    </div>
  );
};

export default PrototypeSwitcher;
