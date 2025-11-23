import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type Align = 'left' | 'center';

interface SectionHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  align?: Align;
  className?: string;
  eyebrow?: ReactNode;
}

const SectionHeader = ({
  title,
  subtitle,
  description,
  align = 'left',
  className = '',
  eyebrow,
}: SectionHeaderProps) => {
  const isCenter = align === 'center';
  return (
    <div className={cn('mb-16', isCenter ? 'text-center' : '', className)}>
      {eyebrow && (
        <p
          className={cn(
            'text-sm uppercase tracking-[0.2em] text-white/60 mb-3',
            isCenter ? 'justify-center flex' : ''
          )}
        >
          <span>{eyebrow}</span>
        </p>
      )}
      <h2 className={cn('text-section-title text-hierarchy-primary', isCenter ? '' : '')}>
        {title}
        {subtitle && (
          <>
            <br />
            <span className="text-hierarchy-muted">{subtitle}</span>
          </>
        )}
      </h2>
      <div className={cn('h-1 bg-white/40', isCenter ? 'w-24 mx-auto mt-6' : 'w-24 mt-4')} />
      {description && (
        <p className={cn('mt-6 text-white/60 max-w-2xl', isCenter ? 'mx-auto' : '')}>
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
