'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { getImageUrl } from '@/lib/image-utils';

interface SignUpForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpForm>({
    defaultValues: {
      role: 'FARMER',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: SignUpForm) => {
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const { confirmPassword, ...registerData } = data;
      const response = await authAPI.register(registerData);
      
      const user = response.user;
      if (user.profileImage) {
        user.profileImage = getImageUrl(user.profileImage) || user.profileImage;
      }
      
      setAuth(user, response.token);
      router.push('/');
    } catch (err: any) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 409) {
          errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
        } else if (status === 400) {
          if (data?.details && Array.isArray(data.details)) {
            errorMessage = data.details.join(', ');
          } else {
            errorMessage = data?.error || data?.message || 'Invalid information provided. Please check your details and try again.';
          }
        } else if (status >= 500) {
          errorMessage = 'Server is temporarily unavailable. Please try again in a few moments.';
        } else if (data?.error) {
          errorMessage = data.error;
        } else if (data?.message) {
          errorMessage = data.message;
        }
      } else if (err.message) {
        const msg = err.message.toLowerCase();
        if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch')) {
          errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
        } else if (msg.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else if (!msg.includes('registration') && !msg.includes('account') && !msg.includes('email')) {
          errorMessage = 'Something went wrong. Please try again.';
        }
      }
      
      setError(errorMessage);
    } finally {
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
          Sign Up
        </h1>
        <p 
          className="text-center mb-8 mx-auto"
          style={{ 
            color: '#949494',
            fontSize: '15px',
            fontWeight: 400,
            width: '321px'
          }}
        >
          Fill in your credentials to create an account in FreSure
        </p>

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
              type="text"
              placeholder="Full name"
              {...register('name', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
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
          {errors.name && (
            <div className="flex justify-center">
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
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

          <div className="flex justify-center">
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match',
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
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showConfirmPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
              </button>
            </div>
          </div>
          {errors.confirmPassword && (
            <div className="flex justify-center">
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
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
              {loading ? 'Creating account...' : 'Continue'}
            </button>
          </div>
        </form>

        <div className="space-y-3 mt-6 flex flex-col items-center">
          <Link
            href="/login"
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
            Log in to your account
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
            Log in with Google
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

