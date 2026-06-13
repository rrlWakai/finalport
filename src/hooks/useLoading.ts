import { useState, useEffect } from 'react';

const MIN_DISPLAY_MS = 3200;

export function useLoading() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const start = performance.now();
    const done = () => {
      const elapsed = performance.now() - start;
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
      setTimeout(() => setIsLoading(false), remaining);
    };

    if (document.readyState === 'complete') {
      done();
    } else {
      window.addEventListener('load', done);
      return () => window.removeEventListener('load', done);
    }
  }, []);

  return isLoading;
}
