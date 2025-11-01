import { useEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';

type UseIntersectionObserverOptions = IntersectionObserverInit & {
  once?: boolean;
};

type UseIntersectionObserverResult<T extends Element> = {
  ref: MutableRefObject<T | null>;
  isIntersecting: boolean;
};

export function useIntersectionObserver<T extends Element>(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverResult<T> {
  const { once = true, ...observerOptions } = options;
  const { root, rootMargin, threshold } = observerOptions;
  const thresholdKey = Array.isArray(threshold) ? threshold.join(',') : threshold ?? '0';
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

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        if (once) {
          observer.disconnect();
        }
      } else if (!once) {
        setIsIntersecting(false);
      }
    }, { root, rootMargin, threshold });

    observer.observe(target);

    return () => observer.disconnect();
  }, [once, root, rootMargin, thresholdKey, threshold]);

  return { ref, isIntersecting };
}
