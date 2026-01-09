'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    // TODO: Implement password reset API call
    console.log('Password reset requested for:', data.email);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light to-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">Forgot Password?</h1>
        <p className="text-gray-500 text-center mb-8 text-sm">
          Enter your email address and we'll send you a link to reset your password
        </p>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
            Password reset link has been sent to your email.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <button
              type="submit"
              className="w-full bg-primary-dark text-white py-3 rounded-lg font-medium hover:bg-primary-dark/90 transition-colors"
            >
              Send Reset Link
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link href="/login" className="text-blue-600 text-sm hover:underline">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

