'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiHome, HiLightningBolt, HiChatAlt, HiUser } from 'react-icons/hi';

const DesktopNav = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: HiHome, label: 'Home' },
    { href: '/actions', icon: HiLightningBolt, label: 'Actions' },
    { href: '/feedback', icon: HiChatAlt, label: 'Feedback' },
    { href: '/profile', icon: HiUser, label: 'Profile' },
  ];

  return (
    <nav className="hidden md:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 p-6">
      <div className="mb-8">
        <div className="flex items-center justify-center mx-auto mb-4">
          <img src="/logo.svg" alt="FreSure Logo" className="h-16 w-auto" />
        </div>
        <h2 className="text-xl font-bold text-center">FreSure</h2>
      </div>
      <ul className="space-y-2">
        {navItems.map((item) => {
          // For profile, also highlight if on profile-related pages (settings, terms, privacy)
          const isActive = item.href === '/profile' 
            ? pathname === item.href || pathname === '/settings' || pathname === '/terms' || pathname === '/privacy'
            : pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-light text-primary font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="text-xl" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default DesktopNav;

