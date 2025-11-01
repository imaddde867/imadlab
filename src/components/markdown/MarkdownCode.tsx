import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { ReactNode } from 'react';

type MarkdownCodeProps = {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children?: ReactNode;
};

const MarkdownCode = ({
  inline = false,
  className,
  children,
  node: _node,
}: MarkdownCodeProps) => {
  const [copied, setCopied] = useState(false);
  const codeString = String(children ?? '').replace(/\n$/, '');
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
      <code className="bg-white/15 text-white/95 px-2 py-1 rounded-md text-sm font-mono border border-white/10">
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
          fontFamily:
            'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace',
        }}
      >
        <code className="text-white/90">{children}</code>
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
          fontFamily:
            'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace',
        }}
      >
        <code className="block w-full overflow-x-auto p-5 text-white/90">{children}</code>
      </pre>
    </div>
  );
};

export type { MarkdownCodeProps };
export default MarkdownCode;
