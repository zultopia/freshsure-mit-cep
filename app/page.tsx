'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { dashboardAPI, batchesAPI, retailAPI } from '@/lib/api';
import NavBar from '@/components/NavBar';
import StatusBadge from '@/components/StatusBadge';
import { useHydration } from '@/lib/useHydration';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { HiCube } from 'react-icons/hi';

interface DashboardData {
  totalBatches?: number;
  averageQuality?: number;
  totalRecommendations?: number;
}

interface QualityPerformance {
  day: string;
  score: number;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  status: 'Good' | 'Warning' | 'Critical';
  image?: string;
}

export default function HomePage() {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();
  const hasHydrated = useHydration();
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const [qualityData, setQualityData] = useState<QualityPerformance[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<InventoryItem[]>([]);
  const [outOfStock, setOutOfStock] = useState<InventoryItem[]>([]);
  const [lowOnStock, setLowOnStock] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('Weekly');

  useEffect(() => {
    // Wait for both Zustand and client hydration
    if (!hasHydrated || !_hasHydrated) {
      return; // Still loading from localStorage
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
      
      // Load data with individual error handling to prevent one failure from blocking all
      const [dashboard, quality, inventory, lowStock] = await Promise.all([
        dashboardAPI.getDashboard(user.companyId).catch((err) => {
          console.warn('Dashboard API error:', err);
          return null;
        }),
        dashboardAPI.getQualityPerformance(user.companyId, 7).catch((err) => {
          console.warn('Quality API error:', err);
          return null;
        }),
        retailAPI.getInventory({ limit: 10 }).catch((err) => {
          console.warn('Inventory API error:', err);
          return null;
        }),
        retailAPI.getLowStock().catch((err) => {
          console.warn('Low stock API error:', err);
          return null;
        }),
      ]);

      setDashboardData(dashboard);

      // Transform quality data for chart
      if (quality?.data) {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const transformed = days.map((day, index) => ({
          day,
          score: quality.data[index]?.score || Math.floor(Math.random() * 30) + 70,
        }));
        setQualityData(transformed);
      }

      // Transform inventory data
      if (inventory?.data && inventory.data.length > 0) {
        const items: InventoryItem[] = inventory.data.map((item: any) => ({
          id: item.id,
          name: item.commodity?.name || 'Unknown',
          quantity: item.quantity || 0,
          status: item.quantity > 10 ? 'Good' : item.quantity > 0 ? 'Warning' : 'Critical',
        }));
        setRecentlyAdded(items.slice(0, 2));
        setOutOfStock(items.filter((item) => item.quantity === 0).slice(0, 1));
        setLowOnStock(items.filter((item) => item.quantity > 0 && item.quantity <= 5).slice(0, 1));
      } else {
        // Fallback mock data if API returns empty
        setRecentlyAdded([
          { id: '1', name: 'Pomegranate', quantity: 20, status: 'Good' },
          { id: '2', name: 'Rib Eye', quantity: 40, status: 'Good' },
        ]);
        setOutOfStock([
          { id: '3', name: 'Spinach', quantity: 0, status: 'Warning' },
        ]);
        setLowOnStock([
          { id: '4', name: 'Zucchini', quantity: 4, status: 'Critical' },
        ]);
      }
      
      // Fallback for quality data if API fails
      if (!quality?.data || quality.data.length === 0) {
        setQualityData([
          { day: 'Mon', score: 75 },
          { day: 'Tue', score: 80 },
          { day: 'Wed', score: 78 },
          { day: 'Thu', score: 92 },
          { day: 'Fri', score: 85 },
          { day: 'Sat', score: 88 },
          { day: 'Sun', score: 90 },
        ]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Use mock data for development
      setQualityData([
        { day: 'Mon', score: 75 },
        { day: 'Tue', score: 80 },
        { day: 'Wed', score: 78 },
        { day: 'Thu', score: 92 },
        { day: 'Fri', score: 85 },
        { day: 'Sat', score: 88 },
        { day: 'Sun', score: 90 },
      ]);
      setRecentlyAdded([
        { id: '1', name: 'Pomegranate', quantity: 20, status: 'Good' },
        { id: '2', name: 'Rib Eye', quantity: 40, status: 'Good' },
      ]);
      setOutOfStock([
        { id: '3', name: 'Spinach', quantity: 0, status: 'Warning' },
      ]);
      setLowOnStock([
        { id: '4', name: 'Zucchini', quantity: 4, status: 'Critical' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Show loading only if not hydrated yet, otherwise show content immediately
  if (!hasHydrated || !_hasHydrated || (loading && !qualityData.length && !recentlyAdded.length)) {
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
        {/* Welcome Section */}
        <h1 className="text-3xl font-bold mb-2">Welcome to FreshSure!</h1>

        {/* Quality Performance Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Quality Performance</h2>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            >
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={qualityData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#E5E7EB"
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={{ stroke: '#E5E7EB' }}
                    label={{ 
                      value: 'Score', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fill: '#6B7280', fontSize: 12 }
                    }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      padding: '8px 12px',
                    }}
                    labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px' }}
                    itemStyle={{ color: '#4CAF50', fontWeight: 500 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#4CAF50"
                    strokeWidth={3}
                    fill="url(#colorScore)"
                    dot={{ fill: '#4CAF50', r: 5, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recently Added Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recently Added</h2>
            <Link href="/inventory" className="text-blue-600 text-sm hover:underline">
              See All
            </Link>
          </div>
          <div className="space-y-3">
            {recentlyAdded.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <HiCube className="text-2xl text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.quantity} items</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusBadge status={item.status} />
                  <button className="text-gray-400 hover:text-gray-600">⋯</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Out Of Stock Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Out Of Stock</h2>
            <Link href="/inventory?filter=out-of-stock" className="text-blue-600 text-sm hover:underline">
              See All
            </Link>
          </div>
          <div className="space-y-3">
            {outOfStock.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <HiCube className="text-2xl text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-red-500">{item.quantity} items</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusBadge status="Warning" />
                  <button className="text-gray-400 hover:text-gray-600">⋯</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low On Stock Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Low On Stock</h2>
            <Link href="/inventory?filter=low-stock" className="text-blue-600 text-sm hover:underline">
              See All
            </Link>
          </div>
          <div className="space-y-3">
            {lowOnStock.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <HiCube className="text-2xl text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.quantity} items</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusBadge status={item.status} />
                  <button className="text-gray-400 hover:text-gray-600">⋯</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <NavBar />
    </div>
  );
}

