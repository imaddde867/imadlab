// Moon background image for hero section
const Stars = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      <picture className="absolute inset-0 block" aria-hidden="true">
        {/* 
          For optimal performance, you should provide different image sizes for different screen resolutions.
          If you add alternative assets (e.g. hero-moon-mobile.avif), include them as
          additional <source> tags before these defaults.
        */}

        <source srcSet="/images/hero-moon.avif" type="image/avif" />
        <source srcSet="/images/hero-moon.webp" type="image/webp" />
        <img
          src="/images/hero-moon.png"
          alt=""
          width={2560}
          height={1440}
          sizes="100vw"
          loading="eager"
          decoding="async"
          fetchpriority="high"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ backgroundColor: '#020617' }}
        />
      </picture>
    </div>
  );
};

export default Stars;
