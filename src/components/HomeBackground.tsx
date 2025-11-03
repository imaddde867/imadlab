import { useMemo, type CSSProperties } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useIsCoarsePointer } from "@/hooks/useIsCoarsePointer";

type DotStyle = CSSProperties & {
  "--tw-translate-x"?: string;
  "--tw-translate-y"?: string;
};

const DOT_COUNT = 50;

// Extracted from Hero for global use
const HomeBackground = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isCoarsePointer = useIsCoarsePointer();
  const dots = useMemo(() => {
    if (prefersReducedMotion) {
      return [];
    }
    const count = isCoarsePointer ? Math.ceil(DOT_COUNT / 2) : DOT_COUNT;
    return Array.from({ length: count }, () => {
      const size = Math.random() * 3 + 1;
      const opacity = Math.random() * 0.3 + 0.1;
      const translateX = (Math.random() - 0.5) * 200;
      const translateY = (Math.random() - 0.5) * 200;

      return {
        width: `${size}px`,
        height: `${size}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        opacity: `${opacity}`,
        animationDelay: `${Math.random() * 10}s`,
        "--tw-translate-x": `${translateX}px`,
        "--tw-translate-y": `${translateY}px`,
      } satisfies DotStyle;
    });
  }, [prefersReducedMotion, isCoarsePointer]);

  return (
    <>
      {/* Subtle noise texture */}
      <div className="noise-overlay" />
      {/* Animated background glow (static, not mouse-follow) */}
      <div
        className={`fixed inset-0 pointer-events-none -z-10 ${
          prefersReducedMotion ? 'opacity-10' : 'opacity-20 animate-subtle-flicker'
        }`}
        style={{
          background:
            "radial-gradient(600px circle at 50% 30%, rgba(255,255,255,0.06), transparent 40%)",
        }}
      />
      {/* Background dots */}
      {dots.map((style, index) => (
        <div
          key={index}
          className="fixed bg-white/10 rounded-full animate-dot-move pointer-events-none -z-10"
          style={style}
        />
      ))}
      {/* Asymmetrical grid lines */}
      <div className="fixed inset-0 opacity-10 pointer-events-none -z-10">
        <div className="absolute top-1/3 left-0 w-full h-px bg-white"></div>
        <div className="absolute top-2/3 left-0 w-2/3 h-px bg-white"></div>
        <div className="absolute left-1/4 top-0 w-px h-full bg-white"></div>
        <div className="absolute right-1/3 top-0 w-px h-2/3 bg-white"></div>
      </div>
    </>
  );
};

export default HomeBackground;
