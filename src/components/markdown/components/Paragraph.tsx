import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import clsx from 'clsx';

type ParagraphProps = DetailedHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;

export const Paragraph = ({ className, children, ...props }: ParagraphProps) => (
  <p className={clsx('[&>code]:text-[0.9em]', className)} {...props}>
    {children}
  </p>
);
