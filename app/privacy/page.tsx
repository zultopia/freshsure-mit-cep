'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { HiArrowLeft } from 'react-icons/hi';

export default function PrivacyPage() {
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
            Privacy Policy
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
              <h2 className="text-xl font-semibold mb-3 text-gray-900">1. Information We Collect</h2>
              <p className="text-base leading-relaxed">
                We collect information that you provide directly to us, including
                your name, email address, and company information when you register
                for an account.
              </p>
            </section>
            <section className="pb-4 border-b border-gray-100 last:border-b-0">
              <h2 className="text-xl font-semibold mb-3 text-gray-900">2. How We Use Your Information</h2>
              <p className="text-base leading-relaxed">
                We use the information we collect to provide, maintain, and improve
                our services, process transactions, and send you technical notices.
              </p>
            </section>
            <section className="pb-4 border-b border-gray-100 last:border-b-0">
              <h2 className="text-xl font-semibold mb-3 text-gray-900">3. Information Sharing</h2>
              <p className="text-base leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal information
                to third parties without your consent, except as described in this
                policy.
              </p>
            </section>
            <section className="pb-4 border-b border-gray-100 last:border-b-0">
              <h2 className="text-xl font-semibold mb-3 text-gray-900">4. Data Security</h2>
              <p className="text-base leading-relaxed">
                We implement appropriate security measures to protect your personal
                information against unauthorized access, alteration, disclosure, or
                destruction.
              </p>
            </section>
          </div>
        </div>
      </div>
      <NavBar />
    </div>
  );
}

