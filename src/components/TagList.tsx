import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

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

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {label && <span className="text-sm text-white/70">{label}</span>}
      {visible.map((tag, i) => (
        <span key={i} className="px-2 py-1 text-xs bg-white/10 rounded-md text-white/90">
          {variant === 'hash' ? `#${tag}` : tag}
        </span>
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
              <ChevronDown className="w-3 h-3 mr-1" />
              +{tags.length - initialVisible} more
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default TagList;
