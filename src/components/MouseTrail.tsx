import React, { useEffect, useRef } from 'react';

const MouseTrail: React.FC = () => {
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!trailRef.current) return;

      const dot = document.createElement('div');
      dot.className = 'mouse-trail-dot';
      dot.style.left = `${e.clientX}px`;
      dot.style.top = `${e.clientY}px`;
      trailRef.current.appendChild(dot);

      // Animate and remove the dot
      dot.animate(
        [
          { opacity: 1, transform: 'scale(1)' },
          { opacity: 0, transform: 'scale(0)' },
        ],
        {
          duration: 800, // Fade out and shrink over 800ms
          easing: 'ease-out',
          fill: 'forwards',
        }
      ).onfinish = () => {
        dot.remove();
      };
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div ref={trailRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}>
      <style>
        {`
          .mouse-trail-dot {
            position: absolute;
            width: 6px; /* Small dot size */
            height: 6px;
            background-color: rgba(255, 255, 255, 0.7); /* White, semi-transparent */
            border-radius: 50%;
            transform: translate(-50%, -50%); /* Center the dot on the cursor */
          }
        `}
      </style>
    </div>
  );
};

export default MouseTrail;
