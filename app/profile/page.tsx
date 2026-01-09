'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import NavBar from '@/components/NavBar';
import { HiUser } from 'react-icons/hi';
import { useHydration } from '@/lib/useHydration';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, _hasHydrated } = useAuthStore();
  const hasHydrated = useHydration();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for both Zustand and client hydration
    if (!hasHydrated || !_hasHydrated) {
      return;
    }
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Set initial profile from user to show immediately
    setProfile(user);
    setLoading(false);
    
    // Then load fresh data from API
    loadProfile();
  }, [user, _hasHydrated, hasHydrated]);

  const loadProfile = async () => {
    try {
      // Don't show loading spinner, just update silently
      const data = await authAPI.getProfile().catch((err) => {
        console.warn('Profile API error:', err);
        return user; // Fallback to user from store
      });
      setProfile(data || user);
    } catch (error) {
      console.error('Error loading profile:', error);
      // Keep existing profile data
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Show loading only if not hydrated yet
  if (!hasHydrated || !_hasHydrated || (loading && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light to-white pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-6">Profile</h1>

        {/* User Info */}
        <div className="bg-white rounded-lg p-6 mb-6 flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            <HiUser className="text-2xl text-gray-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile?.name || 'User'}</h2>
            <p className="text-sm text-gray-500">{profile?.email || ''}</p>
            <p className="text-xs text-gray-400 mt-1">Lorem ipsum</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-3 mb-6">
          <Link
            href="/settings"
            className="block bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition-colors"
          >
            <span className="font-medium">Settings</span>
          </Link>
          <div className="bg-gray-100 rounded-lg p-4">
            <span className="font-medium text-gray-400">Menu Item 2</span>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <span className="font-medium text-gray-400">Menu Item 3</span>
          </div>
          <Link
            href="/terms"
            className="block bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition-colors"
          >
            <span className="font-medium">Terms and Conditions</span>
          </Link>
        </div>

        {/* Log Out Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
        >
          Log Out
        </button>
      </div>
      <NavBar />
    </div>
  );
}

