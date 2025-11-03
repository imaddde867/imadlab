import { useEffect, useState } from 'react';

const POINTER_QUERY = '(pointer: coarse)';

/**
 * Detects coarse pointer devices (e.g., touch) so we can trim heavy effects for mobile.
 */
export const useIsCoarsePointer = () => {
  const [isCoarse, setIsCoarse] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia(POINTER_QUERY);
    const update = () => setIsCoarse(mediaQuery.matches);

    update();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', update);
      return () => mediaQuery.removeEventListener('change', update);
    }

    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, []);

  return isCoarse;
};

export default useIsCoarsePointer;
