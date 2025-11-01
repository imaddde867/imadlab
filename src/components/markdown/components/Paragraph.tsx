import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import clsx from 'clsx';

type ParagraphProps = DetailedHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;

export const Paragraph = ({ className, children, ...props }: ParagraphProps) => (
  <p
    className={clsx(
      'mb-6 text-base leading-7 text-white/80 md:text-[1.05rem]',
      '[&>code]:text-[0.9em]',
      className
    )}
    {...props}
  >
    {children}
  </p>
);

