import { useEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';

type UseIntersectionObserverOptions = IntersectionObserverInit & {
  once?: boolean;
  triggerOnce?: boolean; // Alias for 'once' for backward compatibility
};

type UseIntersectionObserverResult<T extends Element> = {
  ref: MutableRefObject<T | null>;
  elementRef: MutableRefObject<T | null>; // Alias for backward compatibility
  isIntersecting: boolean;
  isVisible: boolean; // Alias for backward compatibility
};

/**
 * Hook to detect when an element enters the viewport
 * Supports both ref and elementRef, isIntersecting and isVisible for compatibility
 */
export function useIntersectionObserver<T extends Element>(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverResult<T> {
  const { once = true, triggerOnce = once, ...observerOptions } = options;
  const { root, rootMargin, threshold } = observerOptions;
  const thresholdKey = Array.isArray(threshold) ? threshold.join(',') : (threshold ?? '0');
  const ref = useRef<T | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const target = ref.current;

    if (!target) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false);
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [triggerOnce, root, rootMargin, thresholdKey, threshold]);

  return {
    ref,
    elementRef: ref, // Alias for backward compatibility
    isIntersecting,
    isVisible: isIntersecting, // Alias for backward compatibility
  };
}
