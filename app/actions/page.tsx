'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { actionsAPI, recommendationsAPI } from '@/lib/api';
import NavBar from '@/components/NavBar';
import { useHydration } from '@/lib/useHydration';

interface SummaryCard {
  status: 'Good' | 'Warning' | 'Critical';
  count: number;
}

interface Recommendation {
  id: string;
  batchId: string;
  recommendationType: 'SELL_FAST' | 'STORE' | 'REROUTE' | 'DOWNGRADE' | 'DISCOUNT' | 'PRIORITY_SHIP';
  explanation?: string;
  priority: 'INFO' | 'WARNING' | 'CRITICAL';
  batch?: {
    id: string;
    commodity?: {
      name: string;
    };
  };
}

export default function ActionsPage() {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();
  const hasHydrated = useHydration();
  const [summary, setSummary] = useState<SummaryCard[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for both Zustand and client hydration
    if (!hasHydrated || !_hasHydrated) {
      return;
    }
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    loadData();
  }, [user, _hasHydrated, hasHydrated]);

  const loadData = async () => {
    if (!user?.companyId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Load recommendations with companyId filter
      const recs = await recommendationsAPI.getAll({ 
        limit: 100, // Get more to calculate summary accurately
        companyId: user.companyId,
      }).catch((err) => {
        console.warn('Recommendations API error:', err);
        return { data: [] };
      });

      const recommendationsData = recs?.data || [];
      setRecommendations(recommendationsData);

      // Calculate summary from actual recommendations data
      const goodCount = recommendationsData.filter(
        (rec: Recommendation) => rec.priority === 'INFO'
      ).length;
      const warningCount = recommendationsData.filter(
        (rec: Recommendation) => rec.priority === 'WARNING'
      ).length;
      const criticalCount = recommendationsData.filter(
        (rec: Recommendation) => rec.priority === 'CRITICAL'
      ).length;

      setSummary([
        { status: 'Good', count: goodCount },
        { status: 'Warning', count: warningCount },
        { status: 'Critical', count: criticalCount },
      ]);
    } catch (error) {
      console.error('Error loading actions data:', error);
      // Set empty state on error
      setSummary([
        { status: 'Good', count: 0 },
        { status: 'Warning', count: 0 },
        { status: 'Critical', count: 0 },
      ]);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const getCardStyles = (status: string) => {
    switch (status) {
      case 'Good':
        return 'bg-green-50 border-green-300 text-green-800';
      case 'Warning':
        return 'bg-yellow-50 border-yellow-300 text-yellow-800';
      case 'Critical':
        return 'bg-red-50 border-red-300 text-red-800';
      default:
        return 'bg-gray-50 border-gray-300 text-gray-800';
    }
  };

  const formatRecommendationType = (type: string) => {
    const typeMap: Record<string, string> = {
      'SELL_FAST': 'Sell Fast',
      'STORE': 'Store',
      'REROUTE': 'Reroute',
      'DOWNGRADE': 'Downgrade',
      'DISCOUNT': 'Discount',
      'PRIORITY_SHIP': 'Priority Ship',
    };
    return typeMap[type] || type;
  };

  // Show loading only if not hydrated yet
  if (!hasHydrated || !_hasHydrated || loading) {
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
    <div className="min-h-screen bg-gradient-to-b from-primary-light to-white pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Summary Section */}
        <h1 className="text-3xl font-bold mb-6">Summary</h1>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {summary.map((card) => (
            <div
              key={card.status}
              className={`rounded-lg border-2 p-4 ${getCardStyles(card.status)}`}
            >
              <p className="text-sm font-medium mb-2">{card.status}</p>
              <p className="text-3xl font-bold">{card.count}</p>
              <p className="text-xs mt-1">items</p>
            </div>
          ))}
        </div>

        {/* Recommended Actions Section */}
        <h2 className="text-3xl font-bold mb-6">Recommended Actions</h2>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {recommendations.length === 0 ? (
            <div className="flex items-center justify-center p-12">
              <p className="text-gray-500">No recommended actions at this time</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recommendation Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Explanation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch / Commodity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recommendations.map((rec) => (
                    <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatRecommendationType(rec.recommendationType)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            rec.priority === 'CRITICAL'
                              ? 'bg-red-100 text-red-800'
                              : rec.priority === 'WARNING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {rec.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-md">
                          {rec.explanation || 'No explanation provided'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {rec.batch?.commodity?.name || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {rec.batchId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/feedback?batchId=${rec.batchId}`}
                          className="text-primary hover:text-primary-dark font-medium hover:underline"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <NavBar />
    </div>
  );
}

