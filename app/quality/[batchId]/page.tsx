'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { qualityAPI } from '@/lib/api';
import NavBar from '@/components/NavBar';
import { HiArrowLeft } from 'react-icons/hi';
import { useHydration } from '@/lib/useHydration';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface QualityScore {
  id: string;
  score: number;
  temperature?: number;
  humidity?: number;
  timestamp: string;
}

interface Prediction {
  id: string;
  predictedShelfLife: number;
  confidence: number;
  timestamp: string;
}

export default function QualityPage() {
  const router = useRouter();
  const params = useParams();
  const batchId = params.batchId as string;
  const { user, _hasHydrated } = useAuthStore();
  const hasHydrated = useHydration();
  const [scores, setScores] = useState<QualityScore[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
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
      loadQualityData();
    }
  }, [batchId, user, _hasHydrated, hasHydrated]);

  const loadQualityData = async () => {
    try {
      setLoading(true);
      
      const [scoresData, predictionsData] = await Promise.all([
        qualityAPI.getScoreHistory(batchId).catch(() => ({ data: [] })),
        qualityAPI.getPredictionHistory(batchId).catch(() => ({ data: [] })),
      ]);

      setScores(scoresData.data || []);
      setPredictions(predictionsData.data || []);
    } catch (error) {
      console.error('Error loading quality data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = scores.map((score) => ({
    date: new Date(score.timestamp).toLocaleDateString(),
    score: score.score,
    temperature: score.temperature || 0,
    humidity: score.humidity || 0,
  }));

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
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href={`/batches/${batchId}`}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
          >
            <HiArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-3xl font-bold">Quality History</h1>
        </div>

        {/* Quality Scores Chart */}
        {scores.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Quality Scores Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#4CAF50"
                  strokeWidth={2}
                  name="Quality Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Quality Scores Table */}
        {scores.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Quality Scores</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Score
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Temperature
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Humidity
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {scores.map((score) => (
                    <tr key={score.id}>
                      <td className="px-4 py-2 text-sm font-medium">{score.score}</td>
                      <td className="px-4 py-2 text-sm">{score.temperature || 'N/A'}</td>
                      <td className="px-4 py-2 text-sm">{score.humidity || 'N/A'}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {new Date(score.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Predictions */}
        {predictions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Shelf Life Predictions</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Predicted Shelf Life
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Confidence
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {predictions.map((prediction) => (
                    <tr key={prediction.id}>
                      <td className="px-4 py-2 text-sm font-medium">
                        {prediction.predictedShelfLife} days
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {(prediction.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {new Date(prediction.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {scores.length === 0 && predictions.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500">No quality data available for this batch</p>
          </div>
        )}
      </div>
      <NavBar />
    </div>
  );
}

