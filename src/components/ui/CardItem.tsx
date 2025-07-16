import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './button';
import { Github } from 'lucide-react';
import SpotlightCard from '../SpotlightCard';

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
  // Marquee logic
  const titleRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);
  const [shouldMarquee, setShouldMarquee] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (titleRef.current && containerRef.current) {
      const titleWidth = titleRef.current.scrollWidth;
      const containerWidth = containerRef.current.offsetWidth;
      setShouldMarquee(titleWidth > containerWidth);
    }
  }, [title]);

  return (
    <SpotlightCard className="h-full flex flex-col overflow-hidden">
      {image_url && (
        <div className="w-full aspect-[3/1] overflow-hidden">
          <img src={image_url} alt={title} className="w-full h-full object-cover block" />
        </div>
      )}
      <div className="flex-1 flex flex-col p-6 gap-4">
        {/* Top section: Title */}
        <div className="flex items-start justify-between gap-2">
          <span
            className="text-card-title text-hierarchy-primary leading-tight flex-1 min-w-0 overflow-hidden relative group"
            style={{ display: 'block' }}
            ref={containerRef}
          >
            <span
              ref={titleRef}
              className={
                'block whitespace-nowrap transition-transform duration-700 ease-in-out' +
                (shouldMarquee && isHovered ? ' marquee-animate' : ' truncate')
              }
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
                              (titleRef.current.scrollWidth - containerRef.current.offsetWidth) / 60
                            )
                          : 1.5
                      }s linear`,
                    }
                  : { transform: 'translateX(0)', transition: 'transform 0.5s' }
              }
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {title}
            </span>
          </span>
        </div>
        {/* Tags and date */}
        {(tags?.length || date) && (
          <div className="flex flex-wrap items-center gap-2 min-h-[1.5rem]">
            {tags && tags.map((tag, i) => (
              <span key={i} className="px-2 py-1 text-caption bg-white/10 rounded-full text-hierarchy-secondary">
                {isBlog ? `#${tag}` : tag}
              </span>
            ))}
            {date && <span className="text-caption text-hierarchy-subtle ml-auto">{date}</span>}
          </div>
        )}
        {/* Description/excerpt */}
        {(description || excerpt) && (
          <p className="text-body text-hierarchy-tertiary mb-0 reading-width-narrow">
            {description || excerpt}
          </p>
        )}
        {/* Bottom section: read time, github, and action button all right-aligned */}
        {(readTime || githubUrl || linkTo || link) && (
          <div className="flex items-center justify-end mt-auto pt-2 gap-2">
            {readTime && (
              <span className="text-body-small text-hierarchy-subtle mr-auto">{readTime} min read</span>
            )}
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-hierarchy-muted hover:text-hierarchy-primary transition-colors focus-enhanced"
              >
                <Github className="w-6 h-6" />
              </a>
            )}
            {linkTo && (
              <Link to={linkTo} className="shrink-0">
                <Button variant="ghost" size="sm" className="btn-text-secondary text-hierarchy-muted hover:text-hierarchy-primary hover:bg-transparent focus-enhanced">
                  {linkLabel}
                </Button>
              </Link>
            )}
            {link && !linkTo && (
              <a href={link} target="_blank" rel="noopener noreferrer" className="shrink-0">
                <Button variant="ghost" size="sm" className="btn-text-secondary text-hierarchy-muted hover:text-hierarchy-primary hover:bg-transparent focus-enhanced">
                  {linkLabel}
                </Button>
              </a>
            )}
          </div>
        )}
      </div>
    </SpotlightCard>
  );
};

export default CardItem;