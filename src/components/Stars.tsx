import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useIsCoarsePointer } from '@/hooks/useIsCoarsePointer';

type Star = {
  x: number;
  y: number;
  size: number;
  delay: number;
  hue: number;
  opacity: number;
  blur: number;
  driftX: number;
  driftY: number;
  moveDuration: number;
  twinkleDuration: number;
};

type Counts = { base: number; mid: number; glow: number };

const Stars = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isCoarsePointer = useIsCoarsePointer();

  // Responsive star counts to prevent mobile lag
  const computeCounts = useCallback((): Counts => {
    if (typeof window === 'undefined') {
      return { base: 140, mid: 90, glow: 30 };
    }
    const width = window.innerWidth;
    if (width <= 640) return { base: 30, mid: 18, glow: 6 }; // phones
    if (width <= 1024) return { base: 110, mid: 70, glow: 24 }; // tablets
    return { base: 140, mid: 90, glow: 30 }; // desktop
  }, []);

  const [counts, setCounts] = useState<Counts>(computeCounts);

  useEffect(() => {
    if (prefersReducedMotion || typeof window === 'undefined' || isCoarsePointer) {
      return;
    }
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const next = computeCounts();
        setCounts((current) =>
          current.base === next.base &&
          current.mid === next.mid &&
          current.glow === next.glow
            ? current
            : next
        );
      });
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [computeCounts, prefersReducedMotion, isCoarsePointer]);

  // Layered starfield for depth

  const createStars = useCallback(
    (
      amount: number,
      options: {
        size: [number, number];
        delay: [number, number];
        hue: [number, number];
        opacity: [number, number];
        blur: [number, number];
        drift: number;
        move: { base: number; variance: number };
        twinkle: { base: number; variance: number };
      }
    ): Star[] =>
      Array.from({ length: amount }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * (options.size[1] - options.size[0]) + options.size[0],
        delay: Math.random() * (options.delay[1] - options.delay[0]) + options.delay[0],
        hue: Math.random() * (options.hue[1] - options.hue[0]) + options.hue[0],
        opacity:
          Math.random() * (options.opacity[1] - options.opacity[0]) + options.opacity[0],
        blur: Math.random() * (options.blur[1] - options.blur[0]) + options.blur[0],
        driftX: (Math.random() - 0.5) * options.drift,
        driftY: (Math.random() - 0.5) * options.drift,
        moveDuration:
          options.move.base + Math.random() * options.move.variance,
        twinkleDuration:
          options.twinkle.base + Math.random() * options.twinkle.variance,
      })),
    []
  );

  const baseStars = useMemo<Star[]>(
    () =>
      prefersReducedMotion || isCoarsePointer
        ? []
        : createStars(counts.base, {
            size: [0.4, 1.6],
            delay: [0, 8],
            hue: [210, 230],
            opacity: [0.3, 0.8],
            blur: [0, 0.6],
            drift: 50,
            move: { base: 16, variance: 12 },
            twinkle: { base: 5, variance: 7 },
          }),
    [counts.base, createStars, prefersReducedMotion, isCoarsePointer]
  );

  const midStars = useMemo<Star[]>(
    () =>
      prefersReducedMotion || isCoarsePointer
        ? []
        : createStars(counts.mid, {
            size: [0.8, 2.6],
            delay: [0, 10],
            hue: [220, 230],
            opacity: [0.35, 0.85],
            blur: [0.2, 1],
            drift: 80,
            move: { base: 24, variance: 14 },
            twinkle: { base: 6, variance: 8 },
          }),
    [counts.mid, createStars, prefersReducedMotion, isCoarsePointer]
  );

  const glowStars = useMemo<Star[]>(
    () =>
      prefersReducedMotion || isCoarsePointer
        ? []
        : createStars(counts.glow, {
            size: [1.2, 3.6],
            delay: [0, 12],
            hue: [200, 230],
            opacity: [0.4, 0.8],
            blur: [0.4, 1.6],
            drift: 110,
            move: { base: 32, variance: 16 },
            twinkle: { base: 7, variance: 9 },
          }),
    [counts.glow, createStars, prefersReducedMotion, isCoarsePointer]
  );

  const gradientLayers = (
    <>
      {/* Night gradient + subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(1000px circle at 50% 20%, rgba(60,80,120,0.12), transparent 55%), linear-gradient(180deg, #05060a 0%, #05060a 25%, #03040a 100%)',
        }}
      />

      {/* Soft vignette edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(1200px circle at 50% 40%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.0) 60%, rgba(0,0,0,0.2) 100%)',
        }}
      />
    </>
  );

  if (prefersReducedMotion || isCoarsePointer) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        {gradientLayers}
      </div>
    );
  }

  // Shooting stars removed per request

  // Mouse-tracking parallax removed per request

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {gradientLayers}

      {/* Layers of stars for depth */}
      {[baseStars, midStars, glowStars].map((layer, li) => (
        <div
          key={li}
          className="absolute inset-0 transform-gpu"
          style={{ contain: 'layout paint' }}
        >
          {layer.map((s, i) => {
            const starStyle: CSSProperties & Record<'--tw-translate-x' | '--tw-translate-y', string> = {
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              backgroundColor: `hsl(${s.hue}, 80%, 96%)`,
              opacity: s.opacity,
              filter:
                li === 2
                  ? `blur(${s.blur}px) drop-shadow(0 0 ${Math.max(1.5, s.size * 2)}px rgba(255,255,255,0.12))`
                  : undefined,
              animation: `star-move ${s.moveDuration}s ease-in-out ${s.delay}s infinite alternate, star-twinkle ${s.twinkleDuration}s ease-in-out ${s.delay}s infinite alternate`,
              '--tw-translate-x': `${s.driftX}px`,
              '--tw-translate-y': `${s.driftY}px`,
            };

            return (
              <div
                key={`${li}-${i}`}
                className="absolute rounded-full"
                style={starStyle}
              />
            );
          })}
        </div>
      ))}

      {/* Shooting stars removed */}
    </div>
  );
};

export default Stars;
