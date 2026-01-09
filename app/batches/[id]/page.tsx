'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { batchesAPI, qualityAPI, sensorsAPI, logisticsAPI } from '@/lib/api';
import NavBar from '@/components/NavBar';
import { HiCube, HiArrowLeft } from 'react-icons/hi';
import { useHydration } from '@/lib/useHydration';

interface Batch {
  id: string;
  commodity?: {
    name: string;
  };
  quantity: number;
  status: string;
  harvestDate?: string;
  createdAt?: string;
}

interface QualityScore {
  score: number;
  temperature?: number;
  humidity?: number;
  timestamp?: string;
}

interface SensorReading {
  sensorId: string;
  type: string;
  value: number;
  timestamp: string;
}

export default function BatchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const batchId = params.id as string;
  const { user, _hasHydrated } = useAuthStore();
  const hasHydrated = useHydration();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [qualityScore, setQualityScore] = useState<QualityScore | null>(null);
  const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated || !_hasHydrated) {
      return;
    }
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (batchId) {
      loadBatchData();
    }
  }, [batchId, user, _hasHydrated, hasHydrated]);

  const loadBatchData = async () => {
    try {
      setLoading(true);
      
      const [batchData, qualityData, sensorsData] = await Promise.all([
        batchesAPI.getById(batchId).catch(() => null),
        qualityAPI.getLatestScore(batchId).catch(() => null),
        sensorsAPI.getReadings(batchId).catch(() => ({ data: [] })),
      ]);

      setBatch(batchData);
      setQualityScore(qualityData);
      setSensorReadings(sensorsData.data || []);
    } catch (error) {
      console.error('Error loading batch data:', error);
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

  if (!batch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Batch not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light to-white pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/batches"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
          >
            <HiArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-3xl font-bold">Batch Details</h1>
        </div>

        {/* Batch Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start space-x-4 mb-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <HiCube className="text-2xl text-gray-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">
                {batch.commodity?.name || 'Unknown Commodity'}
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Quantity:</span>
                  <span className="ml-2 font-semibold">{batch.quantity}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className="ml-2 font-semibold">{batch.status}</span>
                </div>
                <div>
                  <span className="text-gray-500">Harvest Date:</span>
                  <span className="ml-2 font-semibold">
                    {batch.harvestDate ? new Date(batch.harvestDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Score */}
        {qualityScore && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Latest Quality Score</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Score</p>
                <p className="text-2xl font-bold text-primary">{qualityScore.score}</p>
              </div>
              {qualityScore.temperature && (
                <div>
                  <p className="text-sm text-gray-500">Temperature</p>
                  <p className="text-2xl font-bold">{qualityScore.temperature}°C</p>
                </div>
              )}
              {qualityScore.humidity && (
                <div>
                  <p className="text-sm text-gray-500">Humidity</p>
                  <p className="text-2xl font-bold">{qualityScore.humidity}%</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sensor Readings */}
        {sensorReadings.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Sensor Readings</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Sensor ID
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Value
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sensorReadings.map((reading, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm">{reading.sensorId}</td>
                      <td className="px-4 py-2 text-sm">{reading.type}</td>
                      <td className="px-4 py-2 text-sm font-medium">{reading.value}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {new Date(reading.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <Link
            href={`/feedback?batchId=${batchId}`}
            className="flex-1 bg-primary text-white py-3 rounded-lg font-medium text-center hover:bg-primary-dark transition-colors"
          >
            Provide Feedback
          </Link>
          <Link
            href={`/quality/${batchId}`}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium text-center hover:bg-gray-300 transition-colors"
          >
            View Quality History
          </Link>
        </div>
      </div>
      <NavBar />
    </div>
  );
}

