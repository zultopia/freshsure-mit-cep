'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import DesktopNav from './DesktopNav';
import { useHydration } from '@/lib/useHydration';

// Routes that should not show DesktopNav (only truly public routes)
const publicRoutes = ['/login', '/signup', '/forgot-password'];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hasHydrated = useHydration();
  
  // Start with empty className to match SSR (always start the same)
  const [marginClass, setMarginClass] = useState('');
  const [isPublicRoute, setIsPublicRoute] = useState(true); // Default to true to match empty className

  useEffect(() => {
    // Only update after hydration to ensure SSR/client match
    if (hasHydrated && pathname) {
      const publicRoute = publicRoutes.includes(pathname);
      setIsPublicRoute(publicRoute);
      setMarginClass(publicRoute ? '' : 'md:ml-64');
    }
  }, [hasHydrated, pathname]);

  // Only show nav after hydration to avoid mismatch
  const shouldShowNav = hasHydrated && !isPublicRoute;

  return (
    <>
      {shouldShowNav && <DesktopNav />}
      <div className={marginClass}>{children}</div>
    </>
  );
}

