'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { retailAPI } from '@/lib/api';
import NavBar from '@/components/NavBar';
import StatusBadge from '@/components/StatusBadge';
import { HiCube, HiArrowLeft } from 'react-icons/hi';
import { useHydration } from '@/lib/useHydration';

interface InventoryItem {
  id: string;
  commodity?: {
    name: string;
  };
  quantity: number;
  status: 'Good' | 'Warning' | 'Critical';
}

export default function InventoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter');
  const { user, _hasHydrated } = useAuthStore();
  const hasHydrated = useHydration();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
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
    
    loadInventory();
  }, [user, filter, _hasHydrated, hasHydrated]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      let data;
      
      if (filter === 'low-stock') {
        data = await retailAPI.getLowStock().catch((err) => {
          console.warn('Low stock API error:', err);
          return { data: [] };
        });
      } else if (filter === 'out-of-stock') {
        const all = await retailAPI.getInventory({ limit: 100 }).catch((err) => {
          console.warn('Inventory API error:', err);
          return { data: [] };
        });
        data = { data: all.data?.filter((item: any) => item.quantity === 0) || [] };
      } else {
        data = await retailAPI.getInventory({ limit: 100 }).catch((err) => {
          console.warn('Inventory API error:', err);
          return { data: [] };
        });
      }
      
      const items: InventoryItem[] = (data.data || []).map((item: any) => ({
        id: item.id,
        commodity: item.commodity,
        quantity: item.quantity || 0,
        status:
          item.quantity > 10
            ? 'Good'
            : item.quantity > 0
            ? 'Warning'
            : 'Critical',
      }));
      setInventory(items);
    } catch (error) {
      console.error('Error loading inventory:', error);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {filter === 'low-stock'
              ? 'Low On Stock'
              : filter === 'out-of-stock'
              ? 'Out Of Stock'
              : 'Inventory'}
          </h1>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <HiArrowLeft className="mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="space-y-3">
          {inventory.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500">No items found</p>
            </div>
          ) : (
            inventory.map((item) => (
              <Link
                key={item.id}
                href={`/feedback?batchId=${item.id}`}
                className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <HiCube className="text-2xl text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {item.commodity?.name || 'Unknown'}
                    </h3>
                    <p
                      className={`text-sm ${
                        item.quantity === 0 ? 'text-red-500' : 'text-gray-500'
                      }`}
                    >
                      {item.quantity} items
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusBadge status={item.status} />
                  <button className="text-gray-400 hover:text-gray-600">⋯</button>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
      <NavBar />
    </div>
  );
}

