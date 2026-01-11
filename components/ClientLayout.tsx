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
  
  const [marginClass, setMarginClass] = useState('');
  const [isPublicRoute, setIsPublicRoute] = useState(true);

  useEffect(() => {
    if (hasHydrated && pathname) {
      const publicRoute = publicRoutes.includes(pathname);
      setIsPublicRoute(publicRoute);
      setMarginClass(publicRoute ? '' : 'md:ml-64');
    }
  }, [hasHydrated, pathname]);

  const shouldShowNav = hasHydrated && !isPublicRoute;

  return (
    <>
      {shouldShowNav && <DesktopNav />}
      <div className={marginClass}>{children}</div>
    </>
  );
}

