import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'orbit' | 'wave';
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className,
  text
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  if (variant === 'dots') {
    return (
      <div className={cn('flex flex-col items-center gap-4', className)}>
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'bg-white rounded-full animate-pulse',
                size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'
              )}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1.4s'
              }}
            />
          ))}
        </div>
        {text && (
          <p className={cn('text-white/60 font-medium', textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex flex-col items-center gap-4', className)}>
        <div className={cn('relative', sizeClasses[size])}>
          <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
          <div className="absolute inset-0 bg-white/40 rounded-full animate-pulse" />
          <div className="relative w-full h-full bg-white/60 rounded-full" />
        </div>
        {text && (
          <p className={cn('text-white/60 font-medium', textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'orbit') {
    return (
      <div className={cn('flex flex-col items-center gap-4', className)}>
        <div className={cn('relative', sizeClasses[size])}>
          <div className="absolute inset-0 border-2 border-white/20 rounded-full" />
          <div className="absolute inset-0 border-2 border-transparent border-t-white rounded-full animate-spin" />
          <div className="absolute inset-2 border border-white/30 rounded-full" />
          <div className="absolute inset-2 border border-transparent border-t-white/60 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        {text && (
          <p className={cn('text-white/60 font-medium', textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'wave') {
    return (
      <div className={cn('flex flex-col items-center gap-4', className)}>
        <div className="flex items-end gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                'bg-white rounded-sm animate-pulse',
                size === 'sm' ? 'w-1' : size === 'md' ? 'w-1.5' : size === 'lg' ? 'w-2' : 'w-3'
              )}
              style={{
                height: size === 'sm' ? '12px' : size === 'md' ? '20px' : size === 'lg' ? '28px' : '36px',
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1.2s'
              }}
            />
          ))}
        </div>
        {text && (
          <p className={cn('text-white/60 font-medium', textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    );
  }

  // Default spinner
  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        <div className="absolute inset-0 border-2 border-white/20 rounded-full" />
        <div className="absolute inset-0 border-2 border-transparent border-t-white border-r-white rounded-full animate-spin" />
      </div>
      {text && (
        <p className={cn('text-white/60 font-medium', textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;