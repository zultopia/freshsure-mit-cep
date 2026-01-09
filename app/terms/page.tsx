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
    <div className="min-h-screen bg-white pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
          >
            <HiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-3xl font-bold">Terms and Conditions</h1>
        </div>
        <div className="prose max-w-none">
          {lastUpdated && (
            <p className="text-gray-600 mb-4">
              Last updated: {lastUpdated}
            </p>
          )}
          <div className="space-y-4 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
              <p>
                By accessing and using FreshSure, you accept and agree to be bound
                by the terms and provision of this agreement.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">2. Use License</h2>
              <p>
                Permission is granted to temporarily use FreshSure for personal,
                non-commercial transitory viewing only.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">3. Disclaimer</h2>
              <p>
                The materials on FreshSure are provided on an 'as is' basis.
                FreshSure makes no warranties, expressed or implied, and hereby
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

