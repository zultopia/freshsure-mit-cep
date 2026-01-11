'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import NavBar from '@/components/NavBar';
import { useHydration } from '@/lib/useHydration';

const feedbackTypes = [
  'Inventory stock',
  'Spoilage misread',
  'Rerouting',
  'Pricing',
];

// Star Icon Component
const StarIcon = ({ filled, className }: { filled: boolean; className?: string }) => {
  if (filled) {
    return (
      <svg
        className={className}
        fill="#009951"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }
  return (
    <svg
      className={className}
      fill="none"
      stroke="#9CA3AF"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );
};

export default function FeedbackPage() {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();
  const hasHydrated = useHydration();
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['Spoilage misread', 'Rerouting']);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(3);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!hasHydrated || !_hasHydrated) {
      return;
    }
    
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, _hasHydrated, hasHydrated, router]);

  const toggleFeedbackType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      // TODO: Implement feedback submission
      console.log('Feedback submitted:', { rating, selectedTypes, comment });
      alert('Feedback submitted successfully!');
      setComment('');
      setSelectedTypes([]);
      setRating(3);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasHydrated || !_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 pt-8 md:pt-12 pb-6 md:pb-8">
        {/* Title */}
        <h1 
          className="mb-6 font-semibold"
          style={{ fontSize: '25px' }}
        >
          Feedback
        </h1>

        {/* White Card */}
        <div 
          className="bg-white rounded-lg p-6 md:p-8 shadow-md transition-shadow hover:shadow-xl"
          style={{ 
            borderRadius: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
        >
          {/* Overall Feedback Heading */}
          <h2 className="text-lg font-bold text-black mb-6 text-center">Overall Feedback</h2>

          {/* Star Rating */}
          <div className="flex gap-2 justify-center mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none transform transition-transform hover:scale-110 active:scale-95"
              >
                <StarIcon
                  filled={star <= rating}
                  className="w-10 h-10 md:w-12 md:h-12"
                />
              </button>
            ))}
          </div>

          {/* Question */}
          <h3 className="text-base font-medium text-black mb-5 text-center">
            What do you dislike on Fresure?
          </h3>

          {/* Tags */}
          <div className="flex flex-wrap gap-2.5 justify-start mb-8">
            {feedbackTypes.map((type) => {
              const isSelected = selectedTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleFeedbackType(type)}
                  className={`px-4 py-2 rounded-full text-xs font-medium text-black transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                    isSelected
                      ? 'shadow-md'
                      : 'shadow-sm'
                  }`}
                  style={{
                    backgroundColor: isSelected ? '#B1D158' : '#D9D9D9',
                  }}
                >
                  {type}
                </button>
              );
            })}
          </div>

          {/* Comments Text Area */}
          <form onSubmit={handleSubmit}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add comments..."
              className="w-full h-32 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none mb-6 transition-all"
              style={{
                borderRadius: '10px',
                fontSize: '15px',
              }}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg disabled:hover:shadow-md disabled:hover:scale-100"
              style={{
                backgroundColor: '#4A7450',
                borderRadius: '10px',
                fontSize: '15px',
              }}
            >
              {submitting ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
      <NavBar />
    </div>
  );
}

