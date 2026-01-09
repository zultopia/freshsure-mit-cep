'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { authAPI } from '@/lib/api';
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      setError('');
      const response = await authAPI.login(data.email, data.password);
      
      // Set auth state
      setAuth(response.user, response.token);
      
      // Wait a bit to ensure state is persisted before redirect
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect to home
      router.push('/');
      router.refresh(); // Force refresh to ensure state is loaded
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light to-white flex items-center justify-center px-4 py-8 pb-24 md:pb-8">
      <div className="w-full max-w-md">
        {/* Logo Placeholder */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-600 font-bold text-lg">LOGO</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-2">Log In</h1>
        <p className="text-gray-500 text-center mb-8 text-sm">
          To log in to an account in FreshSure, enter your email and password
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-blue-600 text-sm hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-dark text-white py-3 rounded-lg font-medium hover:bg-primary-dark/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Continue'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Don't have an account yet?
            </span>
          </div>
        </div>

        {/* Additional Buttons */}
        <div className="space-y-3">
          <Link
            href="/signup"
            className="block w-full bg-primary-light text-black py-3 rounded-lg font-medium text-center hover:bg-primary-light/80 transition-colors"
          >
            Create an account
          </Link>
          <button
            type="button"
            className="w-full bg-primary-light text-black py-3 rounded-lg font-medium hover:bg-primary-light/80 transition-colors"
          >
            Sign in with Google
          </button>
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center mt-6">
          By clicking "Continue", I have read and agreed with the{' '}
          <Link href="/terms" className="text-blue-600 underline">
            Term Sheet,
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-blue-600 underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

