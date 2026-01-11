'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useRef, FormEvent, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import NavBar from '@/components/NavBar';
import { HiArrowLeft, HiUser, HiCamera } from 'react-icons/hi';
import { getImageUrl } from '@/lib/image-utils';

export default function SettingsPage() {
  const router = useRouter();
  const { user, setAuth } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to get image source
  const getImageSrc = (image: string | null): string | null => {
    if (!image) return null;
    // If it's a base64 data URL, use it directly
    if (image.startsWith('data:image/')) {
      return image;
    }
    // Otherwise, use getImageUrl to convert backend path
    return getImageUrl(image);
  };

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      // Konversi path hanya untuk display, bukan untuk menyimpan
      // Path asli dari database tetap disimpan di user.profileImage
      const convertedImageUrl = user.profileImage ? getImageUrl(user.profileImage) : null;
      setProfileImage(convertedImageUrl);
    }
  }, [user]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }

    setError(null);
    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to update your profile.');
        return;
      }

      const formData = new FormData();
      formData.append('name', name);
      
      if (selectedFile) {
        formData.append('profilePicture', selectedFile);
      }

      // Don't set Content-Type header for FormData - browser will set it automatically with boundary
      const response = await fetch('/api/proxy/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Explicitly don't set Content-Type - let browser set it for multipart/form-data
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to update profile');
      }
      
      const updatedUser = {
        ...user,
        name: data.name || name,
        profileImage: data.profilePicture || user?.profileImage || undefined,
      };
      setAuth(updatedUser, token);

      const newProfileImagePath = data.profilePicture || user?.profileImage;
      const profilePictureUrl = newProfileImagePath ? getImageUrl(newProfileImagePath) : null;
      setProfileImage(profilePictureUrl);
      setSelectedFile(null);
      
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 pt-8 md:pt-12 pb-6 md:pb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/profile"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
          >
            <HiArrowLeft className="text-xl" />
          </Link>
          <h1 
            className="font-semibold"
            style={{ fontSize: '25px' }}
          >
            Settings
          </h1>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="bg-white rounded-lg p-6 md:p-8 space-y-5 shadow-md"
          style={{ borderRadius: '20px' }}
        >
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Profile Image */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              {getImageSrc(profileImage) ? (
                <img
                  src={getImageSrc(profileImage) || ''}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-4 border-gray-200">
                  <HiUser className="text-4xl text-gray-400" />
                </div>
              )}
              <button
                type="button"
                onClick={handleImageClick}
                disabled={saving}
                className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2.5 hover:bg-primary-dark transition-colors disabled:opacity-50 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
              >
                <HiCamera className="text-lg" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleImageSelect}
                className="hidden"
                disabled={saving}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {selectedFile ? 'New photo selected' : 'Click camera icon to change photo'}
            </p>
          </div>

          <div>
            <label className="block mb-2 font-medium" style={{ fontSize: '15px', color: '#374151' }}>
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={saving}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 transition-all"
              style={{ 
                borderRadius: '10px',
                fontSize: '15px'
              }}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium" style={{ fontSize: '15px', color: '#374151' }}>
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
              style={{ 
                borderRadius: '10px',
                fontSize: '15px'
              }}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium" style={{ fontSize: '15px', color: '#374151' }}>
              Role
            </label>
            <input
              type="text"
              value={user.role}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
              style={{ 
                borderRadius: '10px',
                fontSize: '15px'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-lg font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:hover:shadow-md disabled:hover:scale-100"
            style={{
              backgroundColor: '#4A7450',
              borderRadius: '10px',
              fontSize: '15px',
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
      <NavBar />
    </div>
  );
}

