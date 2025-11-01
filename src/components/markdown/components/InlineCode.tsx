import type { ReactNode } from 'react';

type InlineCodeProps = {
  children: ReactNode;
};

export const InlineCode = ({ children }: InlineCodeProps) => (
  <code className="rounded-md border border-white/10 bg-white/10 px-1.5 py-0.5 font-mono text-[0.9em] text-white/90">
    {children}
  </code>
);

