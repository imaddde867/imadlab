// Moon background image for hero section
const Stars = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      <picture className="absolute inset-0 block" aria-hidden="true">
        {/* 
          For optimal performance, you should provide different image sizes for different screen resolutions.
          You can create smaller versions of the hero-moon image and add them here.
          For example, you can have hero-moon-mobile.avif, hero-moon-tablet.avif, etc.
          The browser will then choose the most appropriate image based on the screen size.

          Here is an example of how you can structure the picture element with different sources:
        */}

        {/* Mobile (up to 768px) */}
        <source media="(max-width: 768px)" srcSet="/images/hero-moon-mobile.avif" type="image/avif" />
        <source media="(max-width: 768px)" srcSet="/images/hero-moon-mobile.webp" type="image/webp" />
        <source media="(max-width: 768px)" srcSet="/images/hero-moon-mobile.png" type="image/png" />

        {/* Tablet (up to 1280px) */}
        <source media="(max-width: 1280px)" srcSet="/images/hero-moon-tablet.avif" type="image/avif" />
        <source media="(max-width: 1280px)" srcSet="/images/hero-moon-tablet.webp" type="image/webp" />
        <source media="(max-width: 1280px)" srcSet="/images/hero-moon-tablet.png" type="image/png" />

        {/* Desktop (default) */}
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
