import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { tagToUrl } from '@/lib/tags';
import { prefetchRoute } from '@/lib/routePrefetch';

interface TagListProps {
  tags: string[];
  initialVisible?: number;
  label?: string;
  variant?: 'hash' | 'plain';
}

const TagList = ({ tags, initialVisible = 3, label, variant = 'hash' }: TagListProps) => {
  const [expanded, setExpanded] = useState(false);
  if (!tags || tags.length === 0) return null;
  const visible = expanded ? tags : tags.slice(0, initialVisible);
  const handleTagClick = (tag: string) => {
    import('@/lib/events')
      .then(({ logEvent }) => logEvent('tag_click', { tag }))
      .catch(() => {});
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {label && <span className="text-sm text-white/70">{label}</span>}
      {visible.map((tag, i) => (
        <Link
          key={i}
          to={tagToUrl(tag)}
          onClick={() => handleTagClick(tag)}
          onPointerEnter={() => prefetchRoute('/tags/:tag')}
          className="px-2 py-1 text-xs bg-white/10 rounded-md text-white/90 hover:bg-white/20 transition-colors"
        >
          {variant === 'hash' ? `#${tag}` : tag}
        </Link>
      ))}
      {tags.length > initialVisible && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
          aria-label={expanded ? 'Show fewer tags' : 'Show all tags'}
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3 h-3 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3 mr-1" />+{tags.length - initialVisible} more
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default TagList;
