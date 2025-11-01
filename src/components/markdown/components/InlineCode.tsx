import type { ReactNode } from 'react';

type InlineCodeProps = {
  children: ReactNode;
};

export const InlineCode = ({ children }: InlineCodeProps) => (
  <code className="rounded-sm bg-white/10 px-1.5 py-[1px] text-[0.95em] text-white/90">
    {children}
  </code>
);
