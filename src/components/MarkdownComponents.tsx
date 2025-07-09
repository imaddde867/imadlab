// Shared Markdown renderers for images and code blocks
import React, { useRef } from 'react';
import { Check, Copy } from 'lucide-react';

export const MarkdownComponents = {
  img: ({ node, ...props }: any) => (
    <img
      {...props}
      style={{
        display: 'block',
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: '100%',
        height: 'auto',
      }}
      className="my-8 rounded-xl shadow-lg"
      alt={props.alt || ''}
    />
  ),
  code: ({ node, inline = false, className, children, ...props }: { node: any; inline?: boolean; className?: string; children: React.ReactNode }) => {
    const codeRef = useRef<HTMLPreElement>(null);
    const [copied, setCopied] = React.useState(false);
    const codeString = String(children).replace(/\n$/, '');
    const handleCopy = () => {
      if (codeRef.current) {
        navigator.clipboard.writeText(codeString);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    };
    if (inline) {
      return (
        <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm" {...props}>
          {children}
        </code>
      );
    }
    return (
      <div className="relative my-6 max-w-none group">
        <pre
          ref={codeRef}
          className={
            `overflow-x-auto p-4 text-sm font-mono bg-transparent border-0 text-white/90 max-w-none` +
            (className ? ` ${className}` : '')
          }
          style={{
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
          }}
        >
          <code {...props}>{children}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-xs px-2 py-1 rounded transition-colors border border-white/10 text-white shadow focus:outline-none focus:ring-2 focus:ring-white/30 flex items-center justify-center"
          title={copied ? 'Copied!' : 'Copy code'}
          type="button"
          aria-label={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" aria-hidden="true" />
          ) : (
            <Copy className="w-4 h-4 text-white/80" aria-hidden="true" />
          )}
          <span className="sr-only">{copied ? 'Copied!' : 'Copy code'}</span>
        </button>
      </div>
    );
  },
};