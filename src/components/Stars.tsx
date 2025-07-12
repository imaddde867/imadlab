import { useEffect, useState } from 'react';

const Stars = () => {
  const [stars, setStars] = useState<Array<{ x: number; y: number; size: number; delay: number }>>([]);
  const [shootingStars, setShootingStars] = useState<Array<{ id: number; x: number; y: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars = Array.from({ length: 200 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5, // Smaller stars
        delay: Math.random() * 5,
      }));
      setStars(newStars);
    };

    const generateShootingStars = () => {
      const newShootingStars = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 10 + 5,
        duration: Math.random() * 2 + 3,
      }));
      setShootingStars(newShootingStars);
    };

    generateStars();
    generateShootingStars();

    const interval = setInterval(generateShootingStars, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: `${Math.random() * 0.7 + 0.3}`,
            animation: `star-move ${Math.random() * 20 + 10}s infinite alternate ease-in-out, star-twinkle ${Math.random() * 5 + 2}s infinite alternate, star-pulse ${Math.random() * 3 + 2}s infinite alternate`,
            animationDelay: `${star.delay}s`,
            '--tw-translate-x': `${(Math.random() - 0.5) * 50}px`,
            '--tw-translate-y': `${(Math.random() - 0.5) * 50}px`,
          }}
        />
      ))}
      {shootingStars.map((star) => (
        <div
          key={star.id}
          className="absolute h-0.5 bg-gradient-to-r from-white to-transparent"
          style={{
            top: `${star.y}%`,
            left: `-50%`,
            width: `150px`,
            transform: 'rotate(-45deg)',
            animation: `shooting-star ${star.duration}s linear ${star.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
};

export default Stars;
