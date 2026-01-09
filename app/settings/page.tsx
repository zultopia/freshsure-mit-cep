'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import NavBar from '@/components/NavBar';
import { HiArrowLeft } from 'react-icons/hi';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light to-white pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/profile"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
          >
            <HiArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="bg-white rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              defaultValue={user.name}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              defaultValue={user.email}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <input
              type="text"
              defaultValue={user.role}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
            />
          </div>
          <button className="w-full bg-primary-dark text-white py-3 rounded-lg font-medium hover:bg-primary-dark/90 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
      <NavBar />
    </div>
  );
}

