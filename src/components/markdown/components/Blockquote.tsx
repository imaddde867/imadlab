import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import clsx from 'clsx';

type BlockquoteProps = DetailedHTMLProps<HTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;

export const Blockquote = ({ className, children, ...props }: BlockquoteProps) => (
  <blockquote
    className={clsx('md-block border-l-2 border-white/20 pl-4 text-white/75', className)}
    {...props}
  >
    {children}
  </blockquote>
);
