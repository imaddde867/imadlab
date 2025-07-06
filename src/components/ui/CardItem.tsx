import { Card, CardHeader, CardContent, CardTitle } from './card';
import { Link } from 'react-router-dom';
import { Button } from './button';
import { Github } from 'lucide-react';

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
    <Card className="relative bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/30 transition-all duration-300 group">
      <CardHeader>
        <CardTitle className="flex items-start justify-between text-white">
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
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-12">
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
        {readTime && (
          <div className="flex items-center justify-between mt-auto">
            <span className="text-white/50 text-sm">{readTime}</span>
          </div>
        )}
      </CardContent>
      {githubUrl && (
        <div className="absolute bottom-4 right-4">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white transition-colors"
          >
            <Github className="w-6 h-6" />
          </a>
        </div>
      )}
    </Card>
  );
};

export default CardItem;
