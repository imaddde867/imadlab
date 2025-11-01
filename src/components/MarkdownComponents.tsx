import { ExternalLink, Quote } from 'lucide-react';
import type { AnchorHTMLAttributes, HTMLAttributes } from 'react';
import MarkdownCode from './markdown/MarkdownCode';
import MarkdownImage from './markdown/MarkdownImage';

export const MarkdownComponents = {
  // Enhanced headings with better hierarchy
  h1: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h1 
      className="text-3xl md:text-4xl font-bold text-white mb-6 mt-12 first:mt-0 leading-tight tracking-tight" 
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h2 
      className="text-2xl md:text-3xl font-semibold text-white mb-5 mt-10 leading-tight tracking-tight border-b border-white/10 pb-3" 
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h3 
      className="text-xl md:text-2xl font-semibold text-white mb-4 mt-8 leading-tight" 
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h4 
      className="text-lg md:text-xl font-medium text-white mb-3 mt-6 leading-tight" 
      {...props}
    >
      {children}
    </h4>
  ),

  // Enhanced paragraphs with better line height and spacing
  p: ({ children, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
    <p 
      className="text-white/80 leading-relaxed mb-6 text-base md:text-lg" 
      style={{ lineHeight: '1.75' }}
      {...props}
    >
      {children}
    </p>
  ),

  // Enhanced lists with better spacing
  ul: ({ children, ...props }: HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside text-white/80 mb-6 space-y-2 pl-4" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside text-white/80 mb-6 space-y-2 pl-4" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: HTMLAttributes<HTMLLIElement>) => (
    <li className="text-base md:text-lg leading-relaxed" {...props}>
      {children}
    </li>
  ),

  // Enhanced blockquotes
  blockquote: ({ children, ...props }: HTMLAttributes<HTMLQuoteElement>) => (
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
  a: ({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
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
  table: ({ children, ...props }: HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-8">
      <table className="w-full border-collapse bg-white/5 rounded-xl overflow-hidden" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-white/10" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }: HTMLAttributes<HTMLTableCellElement>) => (
    <th className="px-6 py-4 text-left text-sm font-semibold text-white border-b border-white/10" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: HTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-6 py-4 text-sm text-white/80 border-b border-white/5" {...props}>
      {children}
    </td>
  ),

  // Horizontal rule
  hr: ({ ...props }: HTMLAttributes<HTMLHRElement>) => (
    <hr className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" {...props} />
  ),
};
