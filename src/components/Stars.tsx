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
  twinklePhase: number;
  travelAxis: 'x' | 'y';
};

type Counts = { base: number; mid: number; glow: number };

type StarRegion = {
  x: [number, number];
  y: [number, number];
};

type StarsProps = {
  enableStarfield?: boolean;
};

const Stars = ({ enableStarfield = true }: StarsProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isCoarsePointer = useIsCoarsePointer();

  // Responsive star counts to prevent mobile lag
  const computeCounts = useCallback((): Counts => {
    if (typeof window === 'undefined') {
      return { base: 140, mid: 90, glow: 26 };
    }
    const width = window.innerWidth;
    if (width <= 640) return { base: 36, mid: 22, glow: 7 }; // phones
    if (width <= 1024) return { base: 108, mid: 66, glow: 20 }; // tablets
    return { base: 140, mid: 90, glow: 26 }; // desktop
  }, []);

  const [counts, setCounts] = useState<Counts>(computeCounts);

  const starRegions = useMemo<StarRegion[]>(() => {
    if (!enableStarfield) {
      return [];
    }
    return [
      { x: [0, 48], y: [0, 76] },
      { x: [52, 100], y: [0, 76] },
    ];
  }, [enableStarfield]);

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
      },
      region: StarRegion
    ): Star[] =>
      Array.from({ length: amount }, () => ({
        x: Math.random() * (region.x[1] - region.x[0]) + region.x[0],
        y: Math.random() * (region.y[1] - region.y[0]) + region.y[0],
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
        twinklePhase: Math.random() * Math.PI * 2,
        travelAxis: Math.random() > 0.5 ? 'x' : 'y',
      })),
    []
  );

  const generateLayer = useCallback(
    (
      amount: number,
      options: Parameters<typeof createStars>[1]
    ): Star[] => {
      if (
        prefersReducedMotion ||
        isCoarsePointer ||
        !enableStarfield ||
        starRegions.length === 0
      ) {
        return [];
      }

      const perRegion = Math.max(1, Math.ceil(amount / starRegions.length));
      const stars = starRegions.flatMap((region) =>
        createStars(perRegion, options, region)
      );
      return stars.slice(0, amount);
    },
    [createStars, enableStarfield, isCoarsePointer, prefersReducedMotion, starRegions]
  );

  const baseStars = useMemo<Star[]>(
    () =>
      generateLayer(counts.base, {
        size: [0.4, 1.6],
        delay: [0, 9],
        hue: [206, 228],
        opacity: [0.18, 0.52],
        blur: [0, 0.45],
        drift: 96,
        move: { base: 24, variance: 13 },
        twinkle: { base: 5.2, variance: 8 },
      }),
    [counts.base, generateLayer]
  );

  const midStars = useMemo<Star[]>(
    () =>
      generateLayer(counts.mid, {
        size: [0.8, 2.6],
        delay: [0, 12],
        hue: [214, 232],
        opacity: [0.24, 0.72],
        blur: [0.15, 0.8],
        drift: 150,
        move: { base: 32, variance: 19 },
        twinkle: { base: 6.2, variance: 9 },
      }),
    [counts.mid, generateLayer]
  );

  const glowStars = useMemo<Star[]>(
    () =>
      generateLayer(counts.glow, {
        size: [1.4, 3.8],
        delay: [0, 12],
        hue: [208, 236],
        opacity: [0.32, 0.82],
        blur: [0.6, 1.8],
        drift: 210,
        move: { base: 38, variance: 23 },
        twinkle: { base: 6.8, variance: 12 },
      }),
    [counts.glow, generateLayer]
  );

  const gradientLayers = (
    <>
      <picture className="absolute inset-0 block" aria-hidden="true">
        <source srcSet="/images/hero-moon.avif" type="image/avif" />
        <source srcSet="/images/hero-moon.webp" type="image/webp" />
        <img
          src="/images/hero-moon.png"
          alt=""
          width={2560}
          height={1440}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ backgroundColor: '#020617' }}
        />
      </picture>
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
      {enableStarfield && !prefersReducedMotion && !isCoarsePointer && (
        <div
          className="absolute inset-0"
          style={{
            maskImage:
              'radial-gradient(circle at 50% 92%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 36%, rgba(0,0,0,1) 58%)',
            WebkitMaskImage:
              'radial-gradient(circle at 50% 92%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 36%, rgba(0,0,0,1) 58%)',
          }}
        >
          {[baseStars, midStars, glowStars].map((layer, li) => (
            <div
              key={li}
              className="absolute inset-0 transform-gpu"
              style={{ contain: 'layout paint' }}
            >
              {layer.map((s, i) => {
                const filterParts: string[] = [];
                if (li === 2) {
                  filterParts.push(`blur(${s.blur.toFixed(2)}px)`);
                  filterParts.push(
                    `drop-shadow(0 0 ${Math.max(1.2, s.size * 1.8).toFixed(2)}px rgba(130,160,255,0.18))`
                  );
                } else if (li === 1) {
                  filterParts.push(
                    `drop-shadow(0 0 ${Math.max(0.8, s.size * 1.5).toFixed(2)}px rgba(140,170,255,0.14))`
                  );
                }
                const filter = filterParts.length > 0 ? filterParts.join(' ') : undefined;
                const animations = [
                  `${s.travelAxis === 'x' ? 'star-drift-x' : 'star-drift-y'} ${s.moveDuration}s ease-in-out ${s.delay}s infinite alternate`,
                  `star-twinkle ${s.twinkleDuration}s ease-in-out ${s.delay + s.twinklePhase}s infinite alternate`,
                ].join(', ');

                const starStyle: CSSProperties & Record<'--tw-translate-x' | '--tw-translate-y', string> = {
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  width: `${s.size}px`,
                  height: `${s.size}px`,
                  backgroundColor: `hsl(${s.hue}, 80%, 96%)`,
                  opacity: s.opacity,
                  '--tw-star-opacity': s.opacity.toFixed(3),
                  animation: animations,
                  '--tw-translate-x': `${s.driftX}px`,
                  '--tw-translate-y': `${s.driftY}px`,
                  filter,
                  mixBlendMode: li === 0 ? 'lighten' : 'screen',
                  willChange: 'transform, opacity',
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
        </div>
      )}

      {/* Shooting stars removed */}
    </div>
  );
};

export default Stars;
