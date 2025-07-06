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
  readTime?: string;
  isBlog?: boolean;
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
}: CardItemProps) => {
  return (
    <SpotlightCard className="h-full flex flex-col justify-between p-6">
      <div>
        <div className="flex items-start justify-between text-white mb-4">
          <span className="text-xl font-bold">{title}</span>
          {linkTo && (
            <Link to={linkTo}>
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-transparent">
                {linkLabel}
              </Button>
            </Link>
          )}
          {link && !linkTo && (
            <a href={link} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-transparent">
                {linkLabel}
              </Button>
            </a>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags && tags.map((tag, i) => (
            <span key={i} className="px-2 py-1 text-xs bg-white/10 rounded-full text-white font-medium">
              {isBlog ? `#${tag}` : tag}
            </span>
          ))}
          {date && <span className="text-white/50 text-xs ml-auto">{date}</span>}
        </div>
        {(description || excerpt) && (
          <p className="text-white/80 mb-4 leading-relaxed">
            {description || excerpt}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between mt-auto">
        {readTime && (
          <span className="text-white/50 text-sm">{readTime}</span>
        )}
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white transition-colors ml-auto"
          >
            <Github className="w-6 h-6" />
          </a>
        )}
      </div>
    </SpotlightCard>
  );
};

export default CardItem;
