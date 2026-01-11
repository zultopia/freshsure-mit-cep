'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { HiArrowLeft } from 'react-icons/hi';

export default function TermsPage() {
  const router = useRouter();
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    // Set date only on client to avoid hydration mismatch
    setLastUpdated(new Date().toLocaleDateString());
  }, []);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      // Fallback jika tidak ada history, redirect ke home
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 pt-8 md:pt-12 pb-6 md:pb-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
          >
            <HiArrowLeft className="text-xl" />
          </button>
          <h1 
            className="font-semibold"
            style={{ fontSize: '25px' }}
          >
            Terms and Conditions
          </h1>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          {lastUpdated && (
            <p className="text-sm text-gray-500 mb-6 pb-4 border-b border-gray-200">
              Last updated: {lastUpdated}
            </p>
          )}
          <div className="space-y-6 text-gray-700">
            <section className="pb-4 border-b border-gray-100 last:border-b-0">
              <h2 className="text-xl font-semibold mb-3 text-gray-900">1. Acceptance of Terms</h2>
              <p className="text-base leading-relaxed">
                By accessing and using FreSure, you accept and agree to be bound
                by the terms and provision of this agreement.
              </p>
            </section>
            <section className="pb-4 border-b border-gray-100 last:border-b-0">
              <h2 className="text-xl font-semibold mb-3 text-gray-900">2. Use License</h2>
              <p className="text-base leading-relaxed">
                Permission is granted to temporarily use FreSure for personal,
                non-commercial transitory viewing only.
              </p>
            </section>
            <section className="pb-4 border-b border-gray-100 last:border-b-0">
              <h2 className="text-xl font-semibold mb-3 text-gray-900">3. Disclaimer</h2>
              <p className="text-base leading-relaxed">
                The materials on FreSure are provided on an 'as is' basis.
                FreSure makes no warranties, expressed or implied, and hereby
                disclaims and negates all other warranties.
              </p>
            </section>
          </div>
        </div>
      </div>
      <NavBar />
    </div>
  );
}

