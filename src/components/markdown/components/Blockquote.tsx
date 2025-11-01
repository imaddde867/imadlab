import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import clsx from 'clsx';
import { Quote } from 'lucide-react';

type BlockquoteProps = DetailedHTMLProps<HTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;

export const Blockquote = ({ className, children, ...props }: BlockquoteProps) => (
  <blockquote
    className={clsx(
      'relative my-8 rounded-lg border border-white/10 bg-white/5 px-6 py-4 text-base italic text-white/85',
      className
    )}
    {...props}
  >
    <Quote className="absolute left-3 top-3 h-4 w-4 text-white/30" aria-hidden="true" />
    <div className="pl-5">{children}</div>
  </blockquote>
);

