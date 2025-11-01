import { useState } from 'react';
import type { ImgHTMLAttributes } from 'react';

type MarkdownImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  node?: unknown;
};

const MarkdownImage = ({ node: _node, alt, src, title, ...props }: MarkdownImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <figure className="my-10 text-center">
      <div className="relative inline-block max-w-full">
        {!loaded && !error && (
          <div className="absolute inset-0 bg-white/5 animate-pulse rounded-xl flex items-center justify-center min-h-[200px]">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          </div>
        )}
        <img
          src={src}
          alt={alt || ''}
          title={title}
          className={`max-w-full h-auto rounded-xl shadow-2xl transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          loading="lazy"
          {...props}
        />
      </div>
      {(alt || title) && (
        <figcaption className="mt-4 text-sm text-white/60 italic">
          {title || alt}
        </figcaption>
      )}
    </figure>
  );
};

export type { MarkdownImageProps };
export default MarkdownImage;
