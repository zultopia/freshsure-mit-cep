'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import NavBar from '@/components/NavBar';
import { HiUser, HiPencil, HiGlobe, HiBell, HiLockClosed, HiBookOpen, HiExclamation } from 'react-icons/hi';
import { useHydration } from '@/lib/useHydration';
import { getImageUrl } from '@/lib/image-utils';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
  profileImage?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, _hasHydrated } = useAuthStore();
  const hasHydrated = useHydration();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated || !_hasHydrated) {
      return;
    }
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    setProfile(user);
    setLoading(false);
    loadProfile();
  }, [user, _hasHydrated, hasHydrated, router]);

  const loadProfile = async () => {
    try {
      const data = await authAPI.getProfile().catch((err) => {
        console.warn('Profile API error:', err);
        return null;
      });
      
      // Simpan path asli dari database tanpa konversi
      // Konversi hanya dilakukan saat menampilkan gambar menggunakan getImageUrl()
      setProfile(data || user);
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(user);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

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
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 pt-8 md:pt-12 pb-6 md:pb-8">
        {/* Header */}
        <h1 
          className="mb-6 font-semibold text-center"
          style={{ fontSize: '25px' }}
        >
          Profile
        </h1>

        {/* User Info Section */}
        <div 
          className="bg-white rounded-lg p-6 mb-6 flex items-center space-x-4 shadow-md"
          style={{ borderRadius: '20px' }}
        >
          {getImageUrl(user?.profileImage || profile?.profileImage) ? (
            <img
              key={user?.profileImage || profile?.profileImage}
              src={getImageUrl(user?.profileImage || profile?.profileImage) || ''}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-2 border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-gray-200">
              <HiUser className="text-4xl text-gray-400" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name || profile?.name || 'User'}</h2>
            <p className="text-sm text-gray-500 mt-1">{user?.email || profile?.email}</p>
          </div>
        </div>

        {/* Menu Items in White Card */}
        <div 
          className="bg-white rounded-lg mb-6 overflow-hidden shadow-md"
          style={{ borderRadius: '20px' }}
        >
          <Link
            href="/settings"
            className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
          >
            <HiPencil className="text-lg text-gray-600 mr-4" />
            <span className="text-base font-medium text-gray-900">Edit profile</span>
          </Link>
          <div className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
            <HiGlobe className="text-lg text-gray-600 mr-4" />
            <span className="text-base font-medium text-gray-900">Language</span>
          </div>
          <div className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
            <HiBell className="text-lg text-gray-600 mr-4" />
            <span className="text-base font-medium text-gray-900">Notification</span>
          </div>
          <div className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
            <HiLockClosed className="text-lg text-gray-600 mr-4" />
            <span className="text-base font-medium text-gray-900">Change password</span>
          </div>
          <Link
            href="/terms"
            className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
          >
            <HiBookOpen className="text-lg text-gray-600 mr-4" />
            <span className="text-base font-medium text-gray-900">Terms and Conditions</span>
          </Link>
          <Link
            href="/privacy"
            className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
          >
            <HiExclamation className="text-lg text-gray-600 mr-4" />
            <span className="text-base font-medium text-gray-900">Privacy policy</span>
          </Link>
        </div>

        {/* Log Out Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 shadow-sm hover:shadow-md"
          style={{ borderRadius: '10px', fontSize: '15px' }}
        >
          Log Out
        </button>
      </div>
      <NavBar />
    </div>
  );
}

