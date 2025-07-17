// Enhanced Markdown renderers with improved typography and syntax highlighting
import React, { useRef, useState, useEffect } from 'react';
import { Check, Copy, ExternalLink, Quote } from 'lucide-react';

// Reading progress hook
export const useReadingProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return progress;
};

// Enhanced reading time calculator
export const calculateReadingTime = (text: string): number => {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

export const MarkdownComponents = {
  // Enhanced headings with better hierarchy
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 
      className="text-3xl md:text-4xl font-bold text-white mb-6 mt-12 first:mt-0 leading-tight tracking-tight" 
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 
      className="text-2xl md:text-3xl font-semibold text-white mb-5 mt-10 leading-tight tracking-tight border-b border-white/10 pb-3" 
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 
      className="text-xl md:text-2xl font-semibold text-white mb-4 mt-8 leading-tight" 
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 
      className="text-lg md:text-xl font-medium text-white mb-3 mt-6 leading-tight" 
      {...props}
    >
      {children}
    </h4>
  ),

  // Enhanced paragraphs with better line height and spacing
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p 
      className="text-white/80 leading-relaxed mb-6 text-base md:text-lg" 
      style={{ lineHeight: '1.75' }}
      {...props}
    >
      {children}
    </p>
  ),

  // Enhanced lists with better spacing
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside text-white/80 mb-6 space-y-2 pl-4" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside text-white/80 mb-6 space-y-2 pl-4" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-base md:text-lg leading-relaxed" {...props}>
      {children}
    </li>
  ),

  // Enhanced blockquotes
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote 
      className="border-l-4 border-white/30 pl-6 py-4 my-8 bg-white/5 rounded-r-lg italic text-white/90 relative"
      {...props}
    >
      <Quote className="absolute top-4 left-2 w-4 h-4 text-white/40" />
      <div className="text-base md:text-lg leading-relaxed">
        {children}
      </div>
    </blockquote>
  ),

  // Enhanced links
  a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      href={href}
      className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/50 hover:decoration-blue-300 transition-colors duration-200 inline-flex items-center gap-1"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
      {href?.startsWith('http') && <ExternalLink className="w-3 h-3" />}
    </a>
  ),

  // Enhanced images with loading states and captions
  img: ({ node, alt, src, title, ...props }: { node?: unknown } & React.ImgHTMLAttributes<HTMLImageElement>) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
      <figure className="my-10 text-center">
        <div className="relative inline-block max-w-full">
          {!loaded && !error && (
            <div className="absolute inset-0 bg-white/5 animate-pulse rounded-xl flex items-center justify-center min-h-[200px]">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
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
  },

  // Enhanced code blocks with syntax highlighting and language detection
  code: ({ node, inline = false, className, children, ...props }: { 
    node?: unknown; 
    inline?: boolean; 
    className?: string; 
    children: React.ReactNode 
  }) => {
    const codeRef = useRef<HTMLPreElement>(null);
    const [copied, setCopied] = useState(false);
    const codeString = String(children).replace(/\n$/, '');
    // Extract language from className without displaying it as visible text
    const language = className?.replace('language-', '') || '';

    const handleCopy = async () => {
      try {
        // Copy the actual code content, not the language identifier
        await navigator.clipboard.writeText(codeString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
      }
    };

    if (inline) {
      return (
        <code 
          className="bg-white/15 text-white/95 px-2 py-1 rounded-md text-sm font-mono border border-white/10" 
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <div className="relative my-8 group">
        {/* Code block with copy button */}
        <div className="relative">
          {/* Copy button (absolute positioned) */}
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 flex items-center gap-1 bg-white/10 hover:bg-white/20 text-xs px-2 py-1 rounded-md transition-all duration-200 border border-white/10 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 z-10"
            title={copied ? 'Copied!' : 'Copy code'}
            type="button"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-green-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
          
          {/* Code content */}
          <pre
            ref={codeRef}
            className={`overflow-x-auto p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 ${language ? `language-${language}` : ''}`}
            style={{ 
              fontSize: '14px',
              lineHeight: '1.6',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace'
            }}
          >
            <code className={`text-white/90 font-mono ${language ? `language-${language}` : ''}`} {...props}>
              {children}
            </code>
          </pre>
        </div>
      </div>
    );
  },

  // Enhanced tables
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-8">
      <table className="w-full border-collapse bg-white/5 rounded-xl overflow-hidden" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-white/10" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="px-6 py-4 text-left text-sm font-semibold text-white border-b border-white/10" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-6 py-4 text-sm text-white/80 border-b border-white/5" {...props}>
      {children}
    </td>
  ),

  // Horizontal rule
  hr: ({ ...props }: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" {...props} />
  ),
};