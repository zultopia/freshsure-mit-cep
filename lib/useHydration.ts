import { useEffect, useState } from 'react';

/**
 * Custom hook to handle client-side hydration
 * Prevents hydration mismatch errors by ensuring state is only set on client
 */
export function useHydration() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
}

