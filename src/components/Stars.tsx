import { useEffect, useMemo } from 'react';

type Star = {
  x: number;
  y: number;
  size: number;
  delay: number;
  hue: number;
  opacity: number;
  blur: number;
};

const Stars = () => {
  // Layered starfield for depth

  const baseStars = useMemo<Star[]>(() =>
    Array.from({ length: 140 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.2 + 0.4,
      delay: Math.random() * 8,
      hue: 210 + Math.random() * 20, // cool white-blue tint
      opacity: Math.random() * 0.5 + 0.3,
      blur: Math.random() * 0.6,
    })),
  []);

  const midStars = useMemo<Star[]>(() =>
    Array.from({ length: 90 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.8 + 0.8,
      delay: Math.random() * 10,
      hue: 220 + Math.random() * 10,
      opacity: Math.random() * 0.5 + 0.35,
      blur: Math.random() * 0.8 + 0.2,
    })),
  []);

  const glowStars = useMemo<Star[]>(() =>
    Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.4 + 1.2,
      delay: Math.random() * 12,
      hue: 200 + Math.random() * 30,
      opacity: Math.random() * 0.4 + 0.4,
      blur: Math.random() * 1.2 + 0.4,
    })),
  []);

  // Shooting stars removed per request

  // Mouse-tracking parallax removed per request

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Night gradient + subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          // Lowered gradient intensity for a cleaner, darker sky
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

      {/* Layers of stars for depth */}
      {[baseStars, midStars, glowStars].map((layer, li) => (
        <div
          key={li}
          className="absolute inset-0 transform-gpu"
          style={{ contain: 'layout paint' }}
        >
          {layer.map((s, i) => (
            <div
              key={`${li}-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                backgroundColor: `hsl(${s.hue}, 80%, 96%)`,
                opacity: s.opacity,
                // keep glow/filter only on the top glow layer to reduce paint cost
                filter:
                  li === 2
                    ? `blur(${s.blur}px) drop-shadow(0 0 ${Math.max(1.5, s.size * 2)}px rgba(255,255,255,0.12))`
                    : undefined,
                animation: `star-move ${16 + li * 8 + Math.random() * 12}s ease-in-out ${s.delay}s infinite alternate, star-twinkle ${5 + Math.random() * 7}s ease-in-out ${s.delay}s infinite alternate`,
                // gentle drift vector per-star
                // @ts-ignore CSS var for keyframes
                '--tw-translate-x': `${(Math.random() - 0.5) * (li === 0 ? 50 : li === 1 ? 80 : 110)}px`,
                // @ts-ignore
                '--tw-translate-y': `${(Math.random() - 0.5) * (li === 0 ? 50 : li === 1 ? 80 : 110)}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      ))}

      {/* Shooting stars removed */}
    </div>
  );
};

export default Stars;
