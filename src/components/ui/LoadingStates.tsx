import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'dots' | 'pulse' | 'orbit' | 'wave';
  text?: string;
}

// Inline spinner component
const Spinner = ({ size = 'md', variant = 'default', text }: SpinnerProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
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
        return (
          <div className={cn(sizeClasses[size], 'bg-white rounded-full animate-pulse')} />
        );
      default:
        return (
          <div className={cn(sizeClasses[size], 'border-4 border-white/20 border-t-white rounded-full animate-spin')} />
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

// Card skeleton loader
export const CardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse', className)}>
    <div className="space-y-4">
      {/* Image placeholder */}
      <div className="w-full aspect-[16/9] bg-white/10 rounded-xl" />
      
      {/* Title placeholder */}
      <div className="space-y-2">
        <div className="h-6 bg-white/10 rounded w-3/4" />
        <div className="h-4 bg-white/5 rounded w-1/2" />
      </div>
      
      {/* Tags placeholder */}
      <div className="flex gap-2">
        <div className="h-6 bg-white/10 rounded-full w-16" />
        <div className="h-6 bg-white/10 rounded-full w-20" />
        <div className="h-6 bg-white/10 rounded-full w-14" />
      </div>
      
      {/* Description placeholder */}
      <div className="space-y-2">
        <div className="h-4 bg-white/5 rounded w-full" />
        <div className="h-4 bg-white/5 rounded w-4/5" />
        <div className="h-4 bg-white/5 rounded w-3/5" />
      </div>
      
      {/* Button placeholder */}
      <div className="flex justify-end pt-4">
        <div className="h-10 bg-white/10 rounded-lg w-24" />
      </div>
    </div>
  </div>
);

interface PageLoaderProps {
  text?: string;
  variant?: 'default' | 'dots' | 'pulse' | 'orbit' | 'wave';
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
  variant?: 'default' | 'dots' | 'pulse' | 'orbit' | 'wave';
  className?: string;
}

// Content area loader
export const ContentLoader = ({ text = 'Loading content...', variant = 'pulse', className }: ContentLoaderProps) => (
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

interface FormLoaderProps {
  text?: string;
  success?: boolean;
  error?: boolean;
}

// Form submission loader
export const FormLoader = ({ text = 'Processing...', success, error }: FormLoaderProps) => {
  if (success) {
    return (
      <div className="flex items-center gap-2 text-green-400">
        <div className="w-5 h-5 border-2 border-green-400 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
        </div>
        <span className="text-sm font-medium">Success!</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-400">
        <div className="w-5 h-5 border-2 border-red-400 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-red-400 rounded-full" />
        </div>
        <span className="text-sm font-medium">Error occurred</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-blue-400">
      <Spinner size="sm" variant="default" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
};

interface GridSkeletonProps {
  count?: number;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

// Grid skeleton for multiple cards
export const GridSkeleton = ({ count = 6, columns = 3, className }: GridSkeletonProps) => (
  <div className={cn(
    'grid gap-6',
    columns === 1 && 'grid-cols-1',
    columns === 2 && 'grid-cols-1 md:grid-cols-2',
    columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    columns === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    className
  )}>
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

interface TextSkeletonProps {
  lines?: number;
  className?: string;
}

// Text skeleton for blog content
export const TextSkeleton = ({ lines = 5, className }: TextSkeletonProps) => (
  <div className={cn('space-y-3 animate-pulse', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={cn(
          'h-4 bg-white/10 rounded',
          i === lines - 1 ? 'w-3/4' : 'w-full'
        )}
      />
    ))}
  </div>
);

// Branded loading screen for app initialization
export const BrandedLoader = ({ text = 'Loading imadlab...' }: { text?: string }) => (
  <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
    <div className="text-center">
      {/* Animated logo/brand element */}
      <div className="mb-8">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 border-4 border-white/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-white border-r-white rounded-full animate-spin" />
          <div className="absolute inset-2 border-2 border-white/30 rounded-full" />
          <div className="absolute inset-2 border-2 border-transparent border-b-white/60 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
      </div>
      
      {/* Brand name with typing effect */}
      <h1 className="text-2xl font-bold text-white mb-4 tracking-wider">
        imadlab
      </h1>
      
      {/* Loading text */}
      <p className="text-white/60 text-sm font-medium">
        {text}
      </p>
      
      {/* Progress dots */}
      <div className="flex justify-center gap-1 mt-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-white/40 rounded-full animate-pulse"
            style={{
              animationDelay: `${i * 0.3}s`,
              animationDuration: '1.5s'
            }}
          />
        ))}
      </div>
    </div>
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
    lg: 'w-6 h-6'
  };

  return (
    <div className={cn('animate-spin', sizeClasses[size], className)}>
      <div className="w-full h-full border-2 border-transparent border-t-current border-r-current rounded-full" />
    </div>
  );
};
