import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'dots' | 'pulse' | 'orbit';
  text?: string;
}

// Inline spinner component
const Spinner = ({ size = 'md', variant = 'default', text }: SpinnerProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const renderRing = (withOrbitDot = false) => (
    <div className={cn('relative', sizeClasses[size])}>
      <div className="absolute inset-0 rounded-full border border-white/10" />
      <div className="absolute inset-0 rounded-full border-[1.5px] border-transparent border-t-primary/80 border-r-primary/40 animate-[spin_1.1s_linear_infinite]" />
      {withOrbitDot && (
        <div className="absolute inset-0 animate-[spin_1.6s_linear_infinite]">
          <div
            className={cn(
              'absolute left-1/2 top-0 -translate-x-1/2 rounded-full bg-primary/90',
              dotSizeClasses[size]
            )}
          />
        </div>
      )}
    </div>
  );

  const renderSpinner = () => {
    switch (variant) {
      case 'orbit':
        return renderRing(true);
      case 'dots':
        return (
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary/70 rounded-full animate-[pulse_1.2s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 0.18}s` }}
              />
            ))}
          </div>
        );
      case 'pulse':
        return (
          <div
            className={cn(
              sizeClasses[size],
              'rounded-full bg-primary/20 ring-1 ring-primary/40 animate-[pulse_1.6s_ease-in-out_infinite]'
            )}
          />
        );
      default:
        return renderRing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {renderSpinner()}
      {text && <p className="text-white/80 text-sm font-medium">{text}</p>}
    </div>
  );
};

// Card skeleton loader using base Skeleton component
export const CardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('space-y-4', className)}>
    {/* Image placeholder */}
    <Skeleton className="w-full aspect-[16/9]" />

    {/* Title and subtitle */}
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>

    {/* Tags */}
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-14 rounded-full" />
    </div>

    {/* Description */}
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-3/5" />
    </div>

    {/* Button */}
    <div className="flex justify-end pt-4">
      <Skeleton className="h-10 w-24 rounded-lg" />
    </div>
  </div>
);

interface PageLoaderProps {
  text?: string;
  variant?: 'default' | 'dots' | 'pulse' | 'orbit';
}

// Page loading overlay
export const PageLoader = ({ text = 'Loading...', variant = 'orbit' }: PageLoaderProps) => (
  <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="lg" variant={variant} text={text} />
    </div>
  </div>
);

interface ContentLoaderProps {
  text?: string;
  variant?: 'default' | 'dots' | 'pulse' | 'orbit';
  className?: string;
}

// Content area loader
export const ContentLoader = ({
  text = 'Loading content...',
  variant = 'orbit',
  className,
}: ContentLoaderProps) => (
  <div className={cn('flex items-center justify-center py-16', className)}>
    <div className="relative flex w-full flex-col items-center gap-3 text-center">
      <Spinner size="md" variant={variant} />
      <div className="h-px w-24 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-1/3 animate-[loading-slide_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      </div>
      <p className="text-sm font-medium text-white/65">{text}</p>
    </div>
  </div>
);

interface GridSkeletonProps {
  count?: number;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

// Grid skeleton for multiple cards
export const GridSkeleton = ({ count = 6, columns = 3, className }: GridSkeletonProps) => (
  <div
    className={cn(
      'grid gap-6',
      columns === 1 && 'grid-cols-1',
      columns === 2 && 'grid-cols-1 md:grid-cols-2',
      columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      columns === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      className
    )}
  >
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

interface ButtonLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Inline button loader
export const ButtonLoader = ({ size = 'md', className }: ButtonLoaderProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={cn('animate-spin opacity-80', sizeClasses[size], className)}>
      <div className="w-full h-full border-[1.5px] border-transparent border-t-current border-r-current rounded-full" />
    </div>
  );
};
