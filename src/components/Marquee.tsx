import React, { useMemo } from 'react';

interface MarqueeProps {
  words: string[];
  speed?: 'slow' | 'normal' | 'fast';
}

const speedToDuration: Record<string, string> = {
  slow: '60s',
  normal: '40s',
  fast: '20s',
};

const Marquee: React.FC<MarqueeProps> = ({ words, speed = 'normal' }) => {
  // Memoize shuffled words and random delay for efficiency
  const { shuffledWords, animationDelay, duration } = useMemo(() => {
    // Shuffle words
    const arr = [...words];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // Get duration
    const duration = speedToDuration[speed] || speedToDuration.normal;
    // Random negative delay
    const durationSec = parseInt(duration);
    const randomDelay = -Math.random() * durationSec;
    return {
      shuffledWords: arr,
      animationDelay: `${randomDelay}s`,
      duration,
    };
  }, [words, speed]);

  return (
    <div className="relative w-full overflow-hidden py-4">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee ${duration} linear infinite;
        }
      `}</style>
      <div
        className="flex whitespace-nowrap animate-marquee"
        style={{ animationDelay }}
      >
        {/* Duplicate content to create seamless loop */}
        {[...shuffledWords, ...shuffledWords].map((word, index) => (
          <span
            key={index}
            className="text-6xl md:text-7xl lg:text-8xl font-thin text-white/80 mx-12 uppercase tracking-widest"
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
