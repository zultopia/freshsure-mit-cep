'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

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
      setAuth(response.user, response.token);
      router.push('/');
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.details?.join(', ') ||
          'Registration failed. Please try again.'
      );
    } finally {
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
        <h1 className="text-3xl font-bold text-center mb-2">Sign Up</h1>
        <p className="text-gray-500 text-center mb-8 text-sm">
          Fill in your credentials to create an account in FreshSure
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
              type="text"
              placeholder="Full name"
              {...register('name', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
              })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

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

          <div>
            <input
              type="password"
              placeholder="Re-enter your password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
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
            {loading ? 'Creating account...' : 'Continue'}
          </button>
        </form>

        {/* Additional Buttons */}
        <div className="space-y-3 mt-6">
          <Link
            href="/login"
            className="block w-full bg-primary-light text-black py-3 rounded-lg font-medium text-center hover:bg-primary-light/80 transition-colors"
          >
            Log in to your account
          </Link>
          <button
            type="button"
            className="w-full bg-primary-light text-black py-3 rounded-lg font-medium hover:bg-primary-light/80 transition-colors"
          >
            Log in with Google
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

