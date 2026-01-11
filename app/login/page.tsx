'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { useAuthStore } from '@/lib/store';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  // Dummy login function - tidak perlu API call
  const dummyLogin = (email: string, password: string) => {
    // Dummy users data
    const dummyUsers = {
      'farmer@example.com': {
        user: {
          id: 'farmer-1',
          name: 'Farmer User',
          email: 'farmer@example.com',
          role: 'FARMER',
          companyId: 'company-1',
          profileImage: undefined,
        },
        token: 'dummy-token-farmer-123',
      },
      'retail@example.com': {
        user: {
          id: 'retail-1',
          name: 'Retail User',
          email: 'retail@example.com',
          role: 'RETAIL',
          companyId: 'company-2',
          profileImage: undefined,
        },
        token: 'dummy-token-retail-123',
      },
    };

    // Check if email exists in dummy users
    if (dummyUsers[email as keyof typeof dummyUsers]) {
      const userData = dummyUsers[email as keyof typeof dummyUsers];
      // Check password
      if (password === 'password123') {
        return userData;
      }
    }
    return null;
  };

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      setError('');
      
      // Use dummy login instead of API call
      const response = dummyLogin(data.email, data.password);
      
      if (!response) {
        setError('Invalid email or password. Please check your credentials and try again.');
        setLoading(false);
        return;
      }
      
      const user = response.user;
      setAuth(user, response.token);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-24 md:pt-16 md:pb-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img 
            src="/logo.svg" 
            alt="FreSure Logo" 
            style={{ width: '72.03px', height: '56.31px' }}
            className="object-contain"
          />
        </div>

        <h1 
          className="text-center mb-2"
          style={{ 
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
            fontWeight: 600,
            fontSize: '20px'
          }}
        >
          Log In
        </h1>
        <p 
          className="text-center mb-4"
          style={{ 
            color: '#949494',
            fontSize: '15px',
            fontWeight: 400
          }}
        >
          To log in to an account in FreSure,<br />enter your email and password
        </p>

        {/* Development Notice */}
        <div 
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 mx-auto"
          style={{ 
            maxWidth: '321px',
            fontSize: '12px'
          }}
        >
          <p className="text-yellow-800 font-medium mb-2">
            ⚠️ Web App Under Development
          </p>
          <p className="text-yellow-700 leading-relaxed">
            Since the web app is still under development, all content displayed here uses mock data. Login with accounts:
          </p>
          <div className="mt-3 space-y-1 text-yellow-700">
            <p><strong>Farmer:</strong> farmer@example.com / password123</p>
            <p><strong>Retail:</strong> retail@example.com / password123</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="flex justify-center">
              <div 
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                style={{ width: '321px' }}
              >
                {error}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <input
              type="email"
              placeholder="E-mail"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              className="px-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              style={{ 
                color: '#000',
                width: '321px',
                height: '36px',
                borderRadius: '10px'
              }}
            />
          </div>
          {errors.email && (
            <div className="flex justify-center">
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            </div>
          )}

          <div className="flex justify-center">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className="px-3 pr-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                style={{ 
                  color: '#000',
                  width: '321px',
                  height: '36px',
                  borderRadius: '10px'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
              </button>
            </div>
          </div>
          {errors.password && (
            <div className="flex justify-center">
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            </div>
          )}

          <div className="text-center">
            <Link
              href="/forgot-password"
              style={{ 
                color: '#1E00FF',
                fontSize: '15px'
              }}
              className="hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '321px',
                height: '36px',
                backgroundColor: '#4A7450',
                color: '#FFFFFF',
                borderRadius: '10px',
                fontWeight: 400
              }}
              className="hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Continue'}
            </button>
          </div>
        </form>

        <div className="relative my-6">
          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span 
              className="px-2"
              style={{ 
                fontSize: '12px',
                color: '#8A8A8A'
              }}
            >
              Don't have an account yet?
            </span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>
        </div>

        <div className="space-y-3 flex flex-col items-center">
          <Link
            href="/signup"
            style={{
              width: '321px',
              height: '36px',
              backgroundColor: '#B1D158',
              color: '#000000',
              borderRadius: '10px',
              fontWeight: 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="hover:opacity-90 transition-opacity"
          >
            Create an account
          </Link>
          <button
            type="button"
            style={{
              width: '321px',
              height: '36px',
              backgroundColor: '#B1D158',
              color: '#000000',
              borderRadius: '10px',
              fontWeight: 400
            }}
            className="hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <img 
              src="/google.svg" 
              alt="Google" 
              className="w-5 h-5"
            />
            Sign in with Google
          </button>
        </div>

        <p 
          className="text-center mt-6"
          style={{ 
            fontSize: '12px',
            color: '#8A8A8A'
          }}
        >
          By clicking "Continue", I have read and agreed<br />with the{' '}
          <Link href="/terms" style={{ color: '#1E00FF' }} className="underline">
            Term Sheet,
          </Link>{' '}
          and{' '}
          <Link href="/privacy" style={{ color: '#1E00FF' }} className="underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

