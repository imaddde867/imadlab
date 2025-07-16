// Extracted from Hero for global use
const HomeBackground = () => {
  return (
    <>
      {/* Animated background glow (static, not mouse-follow) */}
      <div 
        className="fixed inset-0 opacity-20 animate-subtle-flicker pointer-events-none -z-10"
        style={{background: `radial-gradient(600px circle at 50% 30%, rgba(255,255,255,0.06), transparent 40%)`}}
      />
      {/* Background dots */}
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="fixed bg-white/10 rounded-full animate-dot-move pointer-events-none -z-10"
          style={{
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: `${Math.random() * 0.3 + 0.1}`,
            animationDelay: `${Math.random() * 10}s`,
            '--tw-translate-x': `${(Math.random() - 0.5) * 200}px`,
            '--tw-translate-y': `${(Math.random() - 0.5) * 200}px`,
          } as React.CSSProperties}
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
