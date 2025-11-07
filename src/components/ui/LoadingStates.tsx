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
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'orbit':
        return (
          <div className={cn('relative', sizeClasses[size])}>
            <div className="absolute inset-0 border-4 border-white/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin" />
          </div>
        );
      case 'dots':
        return (
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-white rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        );
      case 'pulse':
        return <div className={cn(sizeClasses[size], 'bg-white rounded-full animate-pulse')} />;
      default:
        return (
          <div
            className={cn(
              sizeClasses[size],
              'border-4 border-white/20 border-t-white rounded-full animate-spin'
            )}
          />
        );
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
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
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
  variant = 'pulse',
  className,
}: ContentLoaderProps) => (
  <div className={cn('flex items-center justify-center py-16', className)}>
    <div className="relative flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/10 px-10 py-12 text-center shadow-[0_18px_60px_rgba(15,23,42,0.45)] backdrop-blur-xl">
      <Spinner size="md" variant={variant} />
      <div className="h-1 w-24 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-1/2 animate-[loading-slide_1.8s_linear_infinite] bg-white/40" />
      </div>
      <p className="text-sm font-medium text-white/70">{text}</p>
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
    <div className={cn('animate-spin', sizeClasses[size], className)}>
      <div className="w-full h-full border-2 border-transparent border-t-current border-r-current rounded-full" />
    </div>
  );
};
