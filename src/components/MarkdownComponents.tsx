import React, { useState } from 'react';
import { Check, Copy, ExternalLink, Quote } from 'lucide-react';

type MarkdownImageProps = { node?: unknown } & React.ImgHTMLAttributes<HTMLImageElement>;

const MarkdownImage: React.FC<MarkdownImageProps> = ({ node: _node, alt, src, title, ...props }) => {
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
};

type MarkdownCodeProps = {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

const MarkdownCode: React.FC<MarkdownCodeProps> = ({ inline = false, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, '');
  const language = className?.replace('language-', '') || '';

  const handleCopy = async () => {
    try {
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

  const isOutputBlock =
    codeString.includes('precision') &&
    codeString.includes('recall') &&
    codeString.includes('f1-score') &&
    codeString.includes('support');

  if (isOutputBlock) {
    return (
      <pre
        className="my-6 p-4 bg-black/30 rounded-lg border border-white/10 overflow-x-auto font-mono text-sm text-white/90"
        style={{
          fontSize: '14px',
          lineHeight: '1.5',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace'
        }}
      >
        <code className="text-white/90" {...props}>
          {children}
        </code>
      </pre>
    );
  }

  return (
    <div className="relative my-6">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white px-3 py-1 rounded-md text-xs flex items-center gap-1 border border-white/10 transition-colors"
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copied ? 'Copied!' : 'Copy'}
      </button>
      {language && (
        <div className="absolute top-3 left-3 bg-white/10 text-white/80 text-xs font-mono px-2 py-1 rounded-md border border-white/10 uppercase tracking-widest">
          {language}
        </div>
      )}
      <pre
        className="bg-black/70 border border-white/10 rounded-xl overflow-hidden shadow-lg"
        style={{
          fontSize: '14px',
          lineHeight: '1.6',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace'
        }}
        {...props}
      >
        <code className="block w-full overflow-x-auto p-5 text-white/90">
          {children}
        </code>
      </pre>
    </div>
  );
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
  img: MarkdownImage,

  // Enhanced code blocks with syntax highlighting and language detection
  code: MarkdownCode,

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
