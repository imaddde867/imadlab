import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tagToUrl } from '@/lib/tags';
import { Github, ExternalLink } from 'lucide-react';
import SpotlightCard from '../SpotlightCard';
import { prefetchRoute } from '@/lib/routePrefetch';

interface CardItemProps {
  title: string;
  tags?: string[];
  date?: string;
  description?: string | null;
  excerpt?: string | null;
  link?: string;
  linkLabel?: string;
  linkTo?: string;
  githubUrl?: string;
  readTime?: number | null;
  isBlog?: boolean;
  image_url?: string | null;
}

const CardItem = ({
  title,
  tags,
  date,
  description,
  excerpt,
  link,
  linkLabel = 'View',
  linkTo,
  githubUrl,
  readTime,
  isBlog = false,
  image_url,
}: CardItemProps) => {
  // Enhanced state management for interactions
  const titleRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLHeadingElement>(null);
  const [shouldMarquee, setShouldMarquee] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const prefetchPath = isBlog ? '/blogs/:slug' : '/projects/:id';

  useEffect(() => {
    if (titleRef.current && containerRef.current) {
      const titleWidth = titleRef.current.scrollWidth;
      const containerWidth = containerRef.current.offsetWidth;
      setShouldMarquee(titleWidth > containerWidth);
    }
  }, [title]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <SpotlightCard className="h-full flex flex-col overflow-hidden transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-2xl group">
      <div
        onMouseEnter={() => setIsCardHovered(true)}
        onMouseLeave={() => setIsCardHovered(false)}
        className="h-full flex flex-col"
      >
        {/* Enhanced image section with better aspect ratio and loading states */}
        {image_url && !imageError && (
          <div className="relative w-full aspect-[16/9] overflow-hidden bg-white/5">
            {/* Loading placeholder */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
              </div>
            )}

            {/* Optimized image with responsive sizes and enhanced hover effects */}
            <img
              src={image_url}
              alt={title}
              width="640"
              height="360"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`w-full h-full object-cover transition-all duration-500 ease-out ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } ${isCardHovered ? 'scale-110' : 'scale-100'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
              decoding="async"
            />

            {/* Gradient overlay for better text readability */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
                isCardHovered ? 'opacity-80' : 'opacity-40'
              }`}
            />

            {/* Hover overlay with subtle animation */}
            <div
              className={`absolute inset-0 bg-white/10 transition-opacity duration-300 ${
                isCardHovered ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>
        )}

        {/* Enhanced content section with better spacing and hierarchy */}
        <div className="flex-1 flex flex-col p-6 gap-4 relative">
          {/* Enhanced title section with better typography */}
          <div className="flex items-start justify-between gap-3">
            <h3
              className="text-xl font-semibold text-white leading-tight flex-1 min-w-0 overflow-hidden relative group"
              ref={containerRef}
            >
              <span
                ref={titleRef}
                className={`block transition-all duration-700 ease-in-out ${
                  shouldMarquee && isHovered ? 'whitespace-nowrap' : 'truncate'
                }`}
                style={
                  shouldMarquee && isHovered
                    ? {
                        transform: `translateX(-${
                          titleRef.current && containerRef.current
                            ? titleRef.current.scrollWidth - containerRef.current.offsetWidth
                            : 0
                        }px)`,
                        transition: `transform ${
                          titleRef.current && containerRef.current
                            ? Math.max(
                                1.5,
                                (titleRef.current.scrollWidth - containerRef.current.offsetWidth) /
                                  60
                              )
                            : 1.5
                        }s linear`,
                      }
                    : { transform: 'translateX(0)', transition: 'transform 0.5s ease-out' }
                }
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {title}
              </span>
            </h3>
          </div>

          {/* Enhanced tags and date section with better visual hierarchy */}
          {(tags?.length || date) && (
            <div className="flex flex-wrap items-center gap-2 min-h-[1.5rem]">
              {tags &&
                tags.slice(0, 4).map((tag, i) => (
                  <Link
                    key={i}
                    to={tagToUrl(tag)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                      isCardHovered
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'bg-white/10 text-white/80'
                    } hover:bg-white/20`}
                  >
                    {isBlog ? `#${tag}` : tag}
                  </Link>
                ))}
              {tags && tags.length > 4 && (
                <span className="px-3 py-1 text-xs font-medium bg-white/5 text-white/60 rounded-full">
                  +{tags.length - 4}
                </span>
              )}
              {date && <span className="text-xs text-white/60 ml-auto font-mono">{date}</span>}
            </div>
          )}

          {/* Enhanced description with better typography */}
          {(description || excerpt) && (
            <p className="text-sm text-white/70 leading-relaxed line-clamp-3 flex-1">
              {description || excerpt}
            </p>
          )}

          {/* Enhanced action section with better visual feedback */}
          {(readTime || githubUrl || linkTo || link) && (
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                {readTime && (
                  <span className="text-xs text-white/50 font-mono">{readTime} min read</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
                    aria-label="View source code"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}

                {(linkTo || link) && (
                  <div className="relative">
                    {linkTo ? (
                      <Link
                        to={linkTo}
                        onPointerEnter={() => prefetchRoute(prefetchPath)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 group"
                      >
                        {linkLabel}
                        <ExternalLink className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Link>
                    ) : (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 group"
                      >
                        {linkLabel}
                        <ExternalLink className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </SpotlightCard>
  );
};

export default CardItem;
