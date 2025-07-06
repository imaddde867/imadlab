import React from 'react';

interface MarqueeProps {
  words: string[];
  speed?: 'slow' | 'normal' | 'fast';
}

const Marquee: React.FC<MarqueeProps> = ({ words, speed = 'normal' }) => {
  const getDuration = () => {
    switch (speed) {
      case 'slow':
        return '60s';
      case 'normal':
        return '40s';
      case 'fast':
        return '20s';
      default:
        return '40s';
    }
  };

  const duration = getDuration();

  return (
    <div className="relative w-full overflow-hidden py-4">
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee ${duration} linear infinite;
        }
      `}</style>
      <div className="flex whitespace-nowrap animate-marquee">
        {/* Duplicate content to create seamless loop */}
        {[...words, ...words].map((word, index) => (
          <span key={index} className="text-4xl md:text-5xl lg:text-6xl font-bold text-white/10 mx-8 uppercase tracking-wider">
            {word}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
