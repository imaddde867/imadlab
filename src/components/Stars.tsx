// Moon background image for hero section
const Stars = () => {
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
    </div>
  );
};

export default Stars;
