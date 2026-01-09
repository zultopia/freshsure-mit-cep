'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { batchesAPI, feedbackAPI } from '@/lib/api';
import NavBar from '@/components/NavBar';
import { useForm } from 'react-hook-form';
import { HiCube } from 'react-icons/hi';
import { useHydration } from '@/lib/useHydration';

interface Batch {
  id: string;
  commodity?: {
    name: string;
  };
  quantity: number;
  status: string;
  harvestDate?: string;
}

interface FeedbackForm {
  feedbackType: string[];
  message: string;
}

const feedbackTypes = [
  'Inventory stock',
  'Spoilage misread',
  'Rerouting',
  'Pricing',
];

export default function FeedbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const batchId = searchParams.get('batchId');
  const { user, _hasHydrated } = useAuthStore();
  const hasHydrated = useHydration();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FeedbackForm>();

  useEffect(() => {
    // Wait for both Zustand and client hydration
    if (!hasHydrated || !_hasHydrated) {
      return;
    }
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (batchId) {
      loadBatch();
    } else {
      // No batchId provided, show feedback list or empty state
      setLoading(false);
    }
  }, [batchId, user, _hasHydrated, hasHydrated]);

  const loadBatch = async () => {
    if (!batchId) return;
    try {
      setLoading(true);
      const data = await batchesAPI.getById(batchId);
      setBatch(data);
    } catch (error) {
      console.error('Error loading batch:', error);
      // Mock data for development
      setBatch({
        id: batchId,
        commodity: { name: 'Zucchini' },
        quantity: 4,
        status: 'ACTIVE',
        harvestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFeedbackType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const onSubmit = async (data: FeedbackForm) => {
    if (!batchId || selectedTypes.length === 0) {
      return;
    }

    try {
      setSubmitting(true);
      // Send feedback for each selected type
      await Promise.all(
        selectedTypes.map((type) =>
          feedbackAPI.create({
            batchId,
            feedbackType: type.toLowerCase().replace(' ', '_'),
            message: data.message || 'No additional message',
          })
        )
      );
      alert('Feedback submitted successfully!');
      reset();
      setSelectedTypes([]);
      router.push('/');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const getDaysAgo = (date: string) => {
    const days = Math.floor(
      (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
    );
    return days === 0 ? 'Today' : `${days} days ago`;
  };

  if (!hasHydrated || !_hasHydrated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
        <NavBar />
      </div>
    );
  }

  if (!batch && batchId) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="mb-4">
              <HiCube className="text-6xl text-gray-300 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Batch not found</h2>
            <p className="text-gray-600 mb-6">
              The batch with ID "{batchId}" could not be found. Please check the batch ID and try again.
            </p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
        <NavBar />
      </div>
    );
  }

  // If no batchId, show message to select a batch
  if (!batchId) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="mb-4">
              <HiCube className="text-6xl text-gray-300 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a Batch</h2>
            <p className="text-gray-600 mb-6">
              Please select a batch from inventory or actions to provide feedback.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/inventory')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
              >
                Go to Inventory
              </button>
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
        <NavBar />
      </div>
    );
  }

  // At this point, batch must exist and batchId must be provided
  if (!batch || !batchId) {
    return null; // This should not happen due to checks above, but TypeScript needs it
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
        {/* Product Card */}
        <div className="bg-gray-100 rounded-t-lg p-6 mb-4">
          <div className="flex items-start space-x-4">
            <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <HiCube className="text-4xl text-gray-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">
                {batch.commodity?.name || 'Unknown'}
              </h2>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-gray-500">In Stock</span>
                  <span className="ml-2 font-semibold">{batch.quantity} items</span>
                </div>
                <div>
                  <span className="text-gray-500">Last Restock</span>
                  <span className="ml-2 font-semibold">
                    {batch.harvestDate
                      ? getDaysAgo(batch.harvestDate)
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Condition Dropdown */}
          <div className="mt-4">
            <label className="text-sm text-gray-500 mb-2 block">Condition</label>
            <select
              className="w-full bg-white rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue="Critical"
            >
              <option>Good</option>
              <option>Warning</option>
              <option>Critical</option>
            </select>
          </div>

          {/* Feedback Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
            <label className="text-sm font-semibold text-gray-500 mb-2 block">
              Misinformation?
            </label>
            <p className="text-xs text-gray-500 mb-4">
              Your input is valuable in helping us better understand your needs
              and tailor our service accordingly.
            </p>

            {/* Feedback Type Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {feedbackTypes.map((type) => {
                const isSelected = selectedTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleFeedbackType(type)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>

            {/* Message Input */}
            <textarea
              {...register('message', {
                required: 'Please provide your feedback',
              })}
              placeholder="Add your report..."
              className="w-full h-32 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            {errors.message && (
              <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || selectedTypes.length === 0}
              className="w-full mt-4 bg-primary-dark text-white py-3 rounded-lg font-medium hover:bg-primary-dark/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

