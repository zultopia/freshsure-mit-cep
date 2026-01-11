'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
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
  createdAt: string;
  batch?: {
    id: string;
    commodity?: {
      name: string;
    };
  };
  action?: {
    id: string;
    actionTaken: 'ACCEPTED' | 'MODIFIED' | 'IGNORED' | 'PENDING';
    notes?: string;
    executedAt?: string;
    createdAt: string;
    user?: {
      id: string;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, _hasHydrated, hasHydrated]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Mock data for recommendations with actions nested
      const mockRecommendations: Recommendation[] = [
        {
          id: 'rec-1',
          batchId: 'batch-001',
          recommendationType: 'SELL_FAST',
          explanation: 'Quality is excellent, recommend selling within 2 days to maximize freshness',
          priority: 'INFO',
          createdAt: new Date().toISOString(),
          batch: {
            id: 'batch-001',
            commodity: {
              name: 'Apple',
            },
          },
          action: {
            id: 'action-1',
            actionTaken: 'ACCEPTED',
            notes: 'Will sell within 2 days as recommended',
            executedAt: new Date(Date.now() - 3600000).toISOString(),
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            user: {
              id: user?.id || 'user-1',
              name: user?.name || 'User',
            },
          },
        },
        {
          id: 'rec-2',
          batchId: 'batch-002',
          recommendationType: 'DISCOUNT',
          explanation: 'Shelf life is decreasing, suggest 10% discount to move inventory',
          priority: 'WARNING',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          batch: {
            id: 'batch-002',
            commodity: {
              name: 'Banana',
            },
          },
          action: {
            id: 'action-2',
            actionTaken: 'MODIFIED',
            notes: 'Applied 15% discount instead of 10%',
            executedAt: new Date(Date.now() - 10800000).toISOString(),
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            user: {
              id: user?.id || 'user-1',
              name: user?.name || 'User',
            },
          },
        },
        {
          id: 'rec-3',
          batchId: 'batch-003',
          recommendationType: 'PRIORITY_SHIP',
          explanation: 'Critical: Shelf life is very low, prioritize immediate sale',
          priority: 'CRITICAL',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          batch: {
            id: 'batch-003',
            commodity: {
              name: 'Tomato',
            },
          },
          action: {
            id: 'action-3',
            actionTaken: 'PENDING',
            notes: 'Reviewing shipping options',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            user: {
              id: user?.id || 'user-1',
              name: user?.name || 'User',
            },
          },
        },
        {
          id: 'rec-4',
          batchId: 'batch-004',
          recommendationType: 'STORE',
          explanation: 'Good quality, can be stored for longer period',
          priority: 'INFO',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          batch: {
            id: 'batch-004',
            commodity: {
              name: 'Orange',
            },
          },
          action: {
            id: 'action-4',
            actionTaken: 'ACCEPTED',
            notes: 'Moved to storage area',
            executedAt: new Date(Date.now() - 7200000).toISOString(),
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            user: {
              id: user?.id || 'user-1',
              name: user?.name || 'User',
            },
          },
        },
        {
          id: 'rec-5',
          batchId: 'batch-005',
          recommendationType: 'DOWNGRADE',
          explanation: 'Quality has decreased, consider downgrading price tier',
          priority: 'WARNING',
          createdAt: new Date(Date.now() - 43200000).toISOString(),
          batch: {
            id: 'batch-005',
            commodity: {
              name: 'Lettuce',
            },
          },
          action: {
            id: 'action-5',
            actionTaken: 'IGNORED',
            notes: 'Quality is still acceptable for current tier',
            createdAt: new Date(Date.now() - 43200000).toISOString(),
            user: {
              id: user?.id || 'user-1',
              name: user?.name || 'User',
            },
          },
        },
        {
          id: 'rec-6',
          batchId: 'batch-006',
          recommendationType: 'SELL_FAST',
          explanation: 'CRITICAL: Must sell immediately, spoilage risk is high',
          priority: 'CRITICAL',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          batch: {
            id: 'batch-006',
            commodity: {
              name: 'Strawberry',
            },
          },
          // No action yet - pending
        },
      ];

      setRecommendations(mockRecommendations);

      // Calculate summary from mock recommendations data
      const goodCount = mockRecommendations.filter(
        (rec) => rec.priority === 'INFO'
      ).length;
      const warningCount = mockRecommendations.filter(
        (rec) => rec.priority === 'WARNING'
      ).length;
      const criticalCount = mockRecommendations.filter(
        (rec) => rec.priority === 'CRITICAL'
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

  const getCardBorderColor = (status: string) => {
    switch (status) {
      case 'Good':
        return '#4A7450';
      case 'Warning':
        return '#675600';
      case 'Critical':
        return '#870000';
      default:
        return '#9CA3AF';
    }
  };

  const getCardFillColor = (status: string) => {
    switch (status) {
      case 'Good':
        return '#CEE297';
      case 'Warning':
        return '#FFF3B3';
      case 'Critical':
        return '#FFBABA';
      default:
        return '#F3F4F6';
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

  const formatActionTaken = (actionTaken: string) => {
    const actionMap: Record<string, string> = {
      'ACCEPTED': 'Accepted',
      'MODIFIED': 'Modified',
      'IGNORED': 'Ignored',
      'PENDING': 'Pending',
    };
    return actionMap[actionTaken] || actionTaken;
  };

  const getActionBadgeColor = (actionTaken: string) => {
    switch (actionTaken) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'MODIFIED':
        return 'bg-blue-100 text-blue-800';
      case 'IGNORED':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
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
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 pt-8 md:pt-12 pb-6 md:pb-8">
        {/* Summary Section */}
        <h1 
          className="mb-4 font-semibold"
          style={{ fontSize: '25px' }}
        >
          Summary
        </h1>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {summary.map((card) => (
            <div
              key={card.status}
              className={`rounded-lg border-2 p-4 text-center text-black`}
              style={{
                borderColor: getCardBorderColor(card.status),
                backgroundColor: getCardFillColor(card.status),
              }}
            >
              <p className="text-sm font-medium mb-1 text-black">{card.status}</p>
              <p className="text-3xl font-bold text-black">{card.count}</p>
              <p className="text-xs mt-1 text-black">items</p>
            </div>
          ))}
        </div>

        {/* Recommended Actions Section */}
        <h2 className="text-xl font-bold mb-4">Recommendations</h2>
        <div className="bg-gray-50 rounded-lg p-4 md:p-6">
          {recommendations.length === 0 ? (
            <div className="flex items-center justify-center p-12 bg-white rounded-lg shadow-md">
              <p className="text-base text-gray-500">No recommendations at this time</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50">
                    <tr className="border-b-2 border-gray-300">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Recommendation Type
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
                        Explanation
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Batch / Commodity
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap min-w-[150px]">
                        Action
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recommendations.map((rec) => (
                      <tr 
                        key={rec.id} 
                        className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-base font-semibold text-gray-900">
                            {formatRecommendationType(rec.recommendationType)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              rec.priority === 'CRITICAL'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : rec.priority === 'WARNING'
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {rec.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-base text-gray-700 leading-relaxed max-w-md">
                            {rec.explanation || <span className="text-gray-400 italic">No explanation provided</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="text-base font-medium text-gray-900">
                              {rec.batch?.commodity?.name || 'Unknown'}
                            </div>
                            <div className="text-xs text-gray-500 font-mono mt-1">
                              {rec.batchId.slice(0, 8)}...
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {rec.action ? (
                            <div className="flex flex-col gap-2">
                              <span
                                className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full w-fit ${getActionBadgeColor(rec.action.actionTaken)}`}
                              >
                                {formatActionTaken(rec.action.actionTaken)}
                              </span>
                              {rec.action.notes && (
                                <div className="text-sm text-gray-600 leading-relaxed">
                                  {rec.action.notes}
                                </div>
                              )}
                              {rec.action.executedAt && (
                                <div className="text-xs text-gray-500">
                                  Exec: {formatDate(rec.action.executedAt)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-base text-gray-400 italic">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-base text-gray-600">
                            {formatDate(rec.createdAt)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      <NavBar />
    </div>
  );
}

