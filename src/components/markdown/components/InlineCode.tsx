import type { ReactNode } from 'react';

type InlineCodeProps = {
  children: ReactNode;
};

export const InlineCode = ({ children }: InlineCodeProps) => (
  <span className="rounded-md border border-white/15 bg-white/10 px-1.5 py-0.5 text-[0.95em] font-medium text-white/90 shadow-sm">
    {children}
  </span>
);
