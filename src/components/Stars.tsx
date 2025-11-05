import { useMemo, type CSSProperties } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useIsCoarsePointer } from '@/hooks/useIsCoarsePointer';

type Star = {
  left: number;
  top: number;
  size: number;
  baseOpacity: number;
  twinkle: number;
  twinkleDelay: number;
  glow: number;
};

type LayerConfig = {
  key: 'base' | 'mid' | 'glow';
  count: number;
  sizeRange: [number, number];
  opacityRange: [number, number];
  twinkleRange: [number, number];
  intensityRange: [number, number];
};

const LAYERS: LayerConfig[] = [
  {
    key: 'base',
    count: 80,
    sizeRange: [0.9, 1.4],
    opacityRange: [0.35, 0.7],
    twinkleRange: [12, 18],
    intensityRange: [0.3, 0.65],
  },
  {
    key: 'mid',
    count: 52,
    sizeRange: [1.1, 1.8],
    opacityRange: [0.45, 0.82],
    twinkleRange: [9, 15],
    intensityRange: [0.45, 0.75],
  },
  {
    key: 'glow',
    count: 26,
    sizeRange: [1.3, 2.6],
    opacityRange: [0.5, 0.9],
    twinkleRange: [14, 22],
    intensityRange: [0.6, 1],
  },
];

const randomWithSeed = (seed: number, offset: number) => {
  const x = Math.sin(seed * 12.9898 + offset * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const makeStars = (layer: LayerConfig, seedOffset: number): Star[] =>
  Array.from({ length: layer.count }, (_, index) => {
    const seed = index + seedOffset;
    const rand = (offset: number) => randomWithSeed(seed, offset);

    const size =
      layer.sizeRange[0] +
      rand(1) * (layer.sizeRange[1] - layer.sizeRange[0]);
    const opacity =
      layer.opacityRange[0] +
      rand(2) * (layer.opacityRange[1] - layer.opacityRange[0]);
    const twinkle =
      layer.twinkleRange[0] +
      rand(3) * (layer.twinkleRange[1] - layer.twinkleRange[0]);
    const glow =
      layer.intensityRange[0] +
      rand(4) * (layer.intensityRange[1] - layer.intensityRange[0]);
    const baseOpacity = Math.min(1, opacity * glow);

    return {
      left: rand(5) * 100,
      top: rand(6) * 100,
      size,
      baseOpacity,
      twinkle,
      twinkleDelay: rand(7) * 12,
      glow,
    };
  });

type StarsProps = {
  enableStarfield?: boolean;
};

const Stars = ({ enableStarfield = true }: StarsProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isCoarsePointer = useIsCoarsePointer();

  const showStarfield = enableStarfield;
  const allowAnimation = showStarfield && !prefersReducedMotion && !isCoarsePointer;

  const layers = useMemo(() => {
    if (!showStarfield) {
      return [];
    }

    return LAYERS.map((layer, index) => ({
      key: layer.key,
      stars: makeStars(layer, index * 97),
    }));
  }, [showStarfield]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
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

      {showStarfield && (
        <div className={`hero-starfield${allowAnimation ? '' : ' hero-starfield--static'}`}>
          {layers.map(({ key, stars }) => (
            <div key={key} className={`hero-starfield__layer hero-starfield__layer--${key}`}>
              {stars.map((star, index) => (
                <span
                  key={`${key}-${index}`}
                  className="hero-starfield__star"
                  style={
                    {
                      '--star-left': `${star.left}%`,
                      '--star-top': `${star.top}%`,
                      '--star-size': `${star.size}px`,
                      '--star-base-opacity': star.baseOpacity.toFixed(3),
                      '--star-twinkle': `${star.twinkle}s`,
                      '--star-twinkle-delay': `${star.twinkleDelay}s`,
                      '--star-glow': star.glow.toFixed(3),
                    } as CSSProperties
                  }
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Stars;
