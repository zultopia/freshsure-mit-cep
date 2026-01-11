'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiHome, HiLightningBolt, HiChatAlt, HiUser, HiPlus } from 'react-icons/hi';
import { useAuthStore } from '@/lib/store';

const NavBar = () => {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const isFarmer = user?.role === 'FARMER';

  const navItems = isFarmer
    ? [
        { href: '/', icon: HiHome, label: 'Home' },
        { href: '/add', icon: HiPlus, label: 'Add' },
        { href: '/feedback', icon: HiChatAlt, label: 'Feedback' },
        { href: '/profile', icon: HiUser, label: 'Profile' },
      ]
    : [
        { href: '/', icon: HiHome, label: 'Home' },
        { href: '/actions', icon: HiLightningBolt, label: 'Actions' },
        { href: '/feedback', icon: HiChatAlt, label: 'Feedback' },
        { href: '/profile', icon: HiUser, label: 'Profile' },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[9999] md:hidden shadow-lg">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          // For profile, also highlight if on profile-related pages (settings, terms, privacy)
          const isActive = item.href === '/profile' 
            ? pathname === item.href || pathname === '/settings' || pathname === '/terms' || pathname === '/privacy'
            : pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full relative ${
                isActive ? 'text-primary' : 'text-gray-500'
              }`}
            >
              <item.icon className="text-xl mb-1" />
              <span
                className={`text-xs font-medium ${
                  isActive ? 'font-bold' : ''
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default NavBar;

