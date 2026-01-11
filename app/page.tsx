'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { dashboardAPI, batchesAPI, retailAPI } from '@/lib/api';
import NavBar from '@/components/NavBar';
import StatusBadge from '@/components/StatusBadge';
import { useHydration } from '@/lib/useHydration';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import { HiCube, HiLocationMarker, HiChevronDown } from 'react-icons/hi';
import { Thermometer } from 'lucide-react';

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
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string>('Good');
  const [selectedMisinformation, setSelectedMisinformation] = useState<string[]>([]);
  const [reportText, setReportText] = useState('');
  
  // Farmer dashboard data
  const [farmerData, setFarmerData] = useState({
    temperature: 10,
    location: 'Apple storage room',
    harvested: 30,
    delivered: 25,
    remaining: 5,
    products: [
      { name: 'Apple', stock: '4 kg', date: '10 May 2025', route: 'Jam' },
      { name: 'Apple', stock: '40 kg', date: '10 July 2025', route: '-' },
      { name: 'Peach', stock: '40 kg', date: '10 July 2025', route: '-' },
    ],
  });
  
  // Temperature cards data (multiple cards for swipe)
  const [temperatureCards] = useState([
    { temperature: 10, location: 'Apple storage room' },
    { temperature: 5, location: 'Banana storage room' },
    { temperature: 25, location: 'Orange storage room' },
  ]);
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe && currentCardIndex < temperatureCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
    if (isRightSwipe && currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };
  
  const currentCard = temperatureCards[currentCardIndex];
  
  // Sorting function
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  // Sorted products
  const sortedProducts = [...farmerData.products].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let aValue: any = a[sortColumn as keyof typeof a];
    let bValue: any = b[sortColumn as keyof typeof b];
    
    // Handle stock (extract number from "4 kg")
    if (sortColumn === 'stock') {
      aValue = parseFloat(aValue.replace(' kg', '').replace(' items', ''));
      bValue = parseFloat(bValue.replace(' kg', '').replace(' items', ''));
    }
    
    // Handle date (convert to comparable format)
    if (sortColumn === 'date') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) {
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 3L3 6H9L6 3Z" fill="#9CA3AF"/>
          <path d="M6 9L9 6H3L6 9Z" fill="#9CA3AF"/>
        </svg>
      );
    }
    
    if (sortDirection === 'asc') {
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 3L3 6H9L6 3Z" fill="#374151"/>
        </svg>
      );
    } else {
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 9L9 6H3L6 9Z" fill="#374151"/>
        </svg>
      );
    }
  };

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

  // Mock data for retail dashboard
  const getMockQualityData = (): QualityPerformance[] => [
    { day: 'Mon', score: 75 },
    { day: 'Tue', score: 80 },
    { day: 'Wed', score: 78 },
    { day: 'Thu', score: 92 },
    { day: 'Fri', score: 85 },
    { day: 'Sat', score: 88 },
    { day: 'Sun', score: 90 },
  ];

  const getMockInventoryData = () => {
    return {
      recentlyAdded: [
        { id: '1', name: 'Pomegranate', quantity: 20, status: 'Good' as const, image: '/Pomegranate.png' },
        { id: '2', name: 'Rib Eye', quantity: 40, status: 'Good' as const, image: '/Rib.png' },
      ],
      outOfStock: [
        { id: '3', name: 'Spinach', quantity: 0, status: 'Warning' as const, image: '/Spinach.png' },
      ],
      lowOnStock: [
        { id: '4', name: 'Zucchini', quantity: 4, status: 'Critical' as const, image: '/Zucchini.png' },
      ],
    };
  };

  const loadData = async () => {
    if (!user?.companyId) {
      // Use mock data if no companyId
      setQualityData(getMockQualityData());
      const mockInventory = getMockInventoryData();
      setRecentlyAdded(mockInventory.recentlyAdded);
      setOutOfStock(mockInventory.outOfStock);
      setLowOnStock(mockInventory.lowOnStock);
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
      if (quality?.data && quality.data.length > 0) {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const transformed = days.map((day, index) => ({
          day,
          score: quality.data[index]?.score || Math.floor(Math.random() * 30) + 70,
        }));
        setQualityData(transformed);
      } else {
        // Use mock data if API returns empty
        setQualityData(getMockQualityData());
      }

      // Transform inventory data
      if (inventory?.data && inventory.data.length > 0) {
        const items: InventoryItem[] = inventory.data.map((item: any) => ({
          id: item.id,
          name: item.commodity?.name || 'Unknown',
          quantity: item.quantity || 0,
          status: item.quantity > 10 ? 'Good' : item.quantity > 0 ? 'Warning' : 'Critical',
          image: item.commodity?.image || undefined,
        }));
        setRecentlyAdded(items.slice(0, 2));
        setOutOfStock(items.filter((item) => item.quantity === 0).slice(0, 1));
        setLowOnStock(items.filter((item) => item.quantity > 0 && item.quantity <= 5).slice(0, 1));
      } else {
        // Use mock data if API returns empty
        const mockInventory = getMockInventoryData();
        setRecentlyAdded(mockInventory.recentlyAdded);
        setOutOfStock(mockInventory.outOfStock);
        setLowOnStock(mockInventory.lowOnStock);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Use mock data on error
      setQualityData(getMockQualityData());
      const mockInventory = getMockInventoryData();
      setRecentlyAdded(mockInventory.recentlyAdded);
      setOutOfStock(mockInventory.outOfStock);
      setLowOnStock(mockInventory.lowOnStock);
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

  if (user?.role === 'FARMER') {
    return (
      <div className="min-h-screen pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 pt-8 md:pt-12 pb-6 md:pb-8">
          <h1 
            className="mb-4 font-semibold"
            style={{ fontSize: '25px' }}
          >
            Welcome to FreSure!
          </h1>
          
          {/* Temperature Alert Card */}
          <div 
            className="bg-white p-4 mb-2 shadow-md overflow-hidden" 
            style={{ borderRadius: '20px' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Thermometer 
                  size={48} 
                  color={
                    currentCard.temperature < 20 ? "#3b82f6" :
                    currentCard.temperature < 30 ? "#facc15" :
                    "#ef4444"
                  }
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2 gap-6">
                  <div className="text-4xl font-bold">{currentCard.temperature}°</div>
                  <div className="text-sm text-gray-700">
                    Decrease temperature to 0° to ensure freshness!
                  </div>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <HiLocationMarker className="mr-1" />
                  {currentCard.location}
                </div>
              </div>
            </div>
          </div>
          
          {/* Dots Indicator */}
          <div className="flex justify-center gap-1 mb-6">
            {temperatureCards.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentCardIndex ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Summary Section */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-md text-center border-2" style={{ borderColor: '#4A7450' }}>
                <div className="text-sm text-gray-600 mb-1">Harvested</div>
                <div className="text-3xl font-bold text-[#4A7450] mb-1">{farmerData.harvested}</div>
                <div className="text-xs text-gray-500">kg</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md text-center border-2" style={{ borderColor: '#675600' }}>
                <div className="text-sm text-gray-600 mb-1">Delivered</div>
                <div className="text-3xl font-bold text-[#675600] mb-1">{farmerData.delivered}</div>
                <div className="text-xs text-gray-500">kg</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md text-center border-2" style={{ borderColor: '#870000' }}>
                <div className="text-sm text-gray-600 mb-1">Remaining</div>
                <div className="text-3xl font-bold text-[#870000] mb-1">{farmerData.remaining}</div>
                <div className="text-xs text-gray-500">items</div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div>
            <h2 className="text-xl font-bold mb-4">Products</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-1 whitespace-nowrap">
                          Product Name
                          <SortIcon column="name" />
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('stock')}
                      >
                        <div className="flex items-center gap-1">
                          Stock
                          <SortIcon column="stock" />
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center gap-1">
                          Date
                          <SortIcon column="date" />
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('route')}
                      >
                        <div className="flex items-center gap-1">
                          Route
                          <SortIcon column="route" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedProducts.map((product, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{product.stock}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{product.date}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{product.route}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <NavBar />
      </div>
    );
  }

  // Find the highlighted day index (Thursday = index 3)
  const highlightedDayIndex = qualityData.findIndex(item => item.day === 'Thu');
  const highlightedScore = highlightedDayIndex >= 0 ? qualityData[highlightedDayIndex]?.score : 0;

  // Handle product click
  const handleProductClick = (item: InventoryItem) => {
    setSelectedProduct(item);
    setSelectedCondition(item.status);
    setSelectedMisinformation([]);
    setReportText('');
  };

  // Handle close modal
  const handleCloseModal = () => {
    setSelectedProduct(null);
    setSelectedMisinformation([]);
    setReportText('');
  };

  // Handle misinformation tag toggle
  const toggleMisinformation = (tag: string) => {
    setSelectedMisinformation((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  // Handle send report
  const handleSendReport = () => {
    if (!selectedProduct) return;
    console.log('Report sent:', {
      product: selectedProduct.name,
      condition: selectedCondition,
      misinformation: selectedMisinformation,
      report: reportText,
    });
    alert('Report sent successfully!');
    handleCloseModal();
  };

  // Custom Dropdown Component (similar to add page)
  const CustomDropdown = ({ 
    value, 
    onChange, 
    options, 
    className = '',
    minWidth = '100px'
  }: { 
    value: string; 
    onChange: (value: string) => void; 
    options: { value: string; label: string }[];
    className?: string;
    minWidth?: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
      <div className={`relative ${className}`} ref={dropdownRef} style={{ minWidth: className.includes('w-full') ? undefined : minWidth }}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent flex items-center justify-between"
          style={{ 
            color: '#000',
            borderRadius: '10px',
            fontSize: '14px'
          }}
        >
          <span className="truncate">{selectedOption?.label || value}</span>
          <HiChevronDown 
            className={`flex-shrink-0 ml-2 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            size={16}
          />
        </button>
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors ${
                  value === option.value ? 'bg-primary-light' : ''
                }`}
                style={{ fontSize: '14px' }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 pt-8 md:pt-12 pb-6 md:pb-8">
        <h1 
          className="mb-4 font-semibold"
          style={{ fontSize: '25px' }}
        >
          Welcome to FreSure!
        </h1>

        {/* Quality Performance Section */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Quality Performance</h2>
            <CustomDropdown
              value={selectedPeriod}
              onChange={(value) => setSelectedPeriod(value)}
              options={[
                { value: 'Weekly', label: 'Weekly' },
                { value: 'Monthly', label: 'Monthly' },
              ]}
              minWidth="110px"
            />
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md" style={{ borderRadius: '20px' }}>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={qualityData}
                  margin={{ top: 10, right: 10, left: 30, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="verticalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#93C5FD" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="#93C5FD" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
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
                    label={{ 
                      value: 'Day', 
                      position: 'insideBottom',
                      offset: -5,
                      style: { textAnchor: 'middle', fill: '#6B7280', fontSize: 12 }
                    }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={{ stroke: '#E5E7EB' }}
                    width={10}
                    label={{ 
                      value: 'Score (0-100)', 
                      angle: -90, 
                      position: 'insideLeft',
                      offset: -25,
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
                    labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px', fontSize: '12px' }}
                    itemStyle={{ color: '#2563EB', fontWeight: 500, fontSize: '12px' }}
                  />
                  {/* Vertical highlight bar for Thursday - using ReferenceArea centered on Thu */}
                  {highlightedDayIndex >= 0 && (
                    <ReferenceArea
                      x1="Wed"
                      x2="Fri"
                      y1={0}
                      y2="dataMax"
                      fill="url(#verticalGradient)"
                      ifOverflow="extendDomain"
                      isFront={false}
                    />
                  )}
                  {/* Area with gradient fill */}
                  <Area
                    type="monotone"
                    dataKey="score"
                    fill="url(#areaGradient)"
                    stroke="none"
                  />
                  {/* Line on top of area */}
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#2563EB"
                    strokeWidth={3}
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      // Yellow dot for Thursday (highlighted day)
                      if (payload.day === 'Thu') {
                        return (
                          <circle
                            key={`dot-${payload.day}-${payload.score}`}
                            cx={cx}
                            cy={cy}
                            r={6}
                            fill="#FCD34D"
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        );
                      }
                      // Default blue dots for other days
                      return (
                        <circle
                          key={`dot-${payload.day}-${payload.score}`}
                          cx={cx}
                          cy={cy}
                          r={4}
                          fill="#2563EB"
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      );
                    }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recently Added Section */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recently Added</h2>
            <Link href="/inventory" className="text-black hover:underline" style={{ fontSize: '14px' }}>
              See All
            </Link>
          </div>
          <div className="space-y-3">
            {recentlyAdded.map((item) => (
              <div
                key={item.id}
                onClick={() => handleProductClick(item)}
                className="bg-white rounded-lg p-4 shadow-md flex items-center justify-between cursor-pointer hover:shadow-lg transition-shadow"
                style={{ borderRadius: '15px' }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100" style={{ borderRadius: '12px' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <HiCube className="text-2xl text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ fontSize: '16px' }}>{item.name}</h3>
                    <p className="text-gray-600" style={{ fontSize: '14px' }}>{item.quantity} items</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusBadge status={item.status} />
                  <button className="text-gray-400 hover:text-gray-600" style={{ fontSize: '18px' }}>⋯</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Out Of Stock Section */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Out Of Stock</h2>
            <Link href="/inventory?filter=out-of-stock" className="text-black hover:underline" style={{ fontSize: '14px' }}>
              See All
            </Link>
          </div>
          <div className="space-y-3">
            {outOfStock.map((item) => (
              <div
                key={item.id}
                onClick={() => handleProductClick(item)}
                className="bg-white rounded-lg p-4 shadow-md flex items-center justify-between cursor-pointer hover:shadow-lg transition-shadow"
                style={{ borderRadius: '15px' }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100" style={{ borderRadius: '12px' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <HiCube className="text-2xl text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ fontSize: '16px' }}>{item.name}</h3>
                    <p className="text-red-500" style={{ fontSize: '14px' }}>{item.quantity} items</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusBadge status="Warning" />
                  <button className="text-gray-400 hover:text-gray-600" style={{ fontSize: '18px' }}>⋯</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low On Stock Section */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Low On Stock</h2>
            <Link href="/inventory?filter=low-stock" className="text-black hover:underline" style={{ fontSize: '14px' }}>
              See All
            </Link>
          </div>
          <div className="space-y-3">
            {lowOnStock.map((item) => (
              <div
                key={item.id}
                onClick={() => handleProductClick(item)}
                className="bg-white rounded-lg p-4 shadow-md flex items-center justify-between cursor-pointer hover:shadow-lg transition-shadow"
                style={{ borderRadius: '15px' }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100" style={{ borderRadius: '12px' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <HiCube className="text-2xl text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ fontSize: '16px' }}>{item.name}</h3>
                    <p className="text-gray-600" style={{ fontSize: '14px' }}>{item.quantity} items</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusBadge status={item.status} />
                  <button className="text-gray-400 hover:text-gray-600" style={{ fontSize: '18px' }}>⋯</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <NavBar />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-end"
          onClick={handleCloseModal}
        >
          {/* Blur Background */}
          <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"></div>
          
          {/* Modal Content */}
          <div 
            className="relative w-full bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
            }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>

            <div className="px-6 pb-8">
              {/* Product Info */}
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-24 h-24 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100 flex-shrink-0" style={{ borderRadius: '12px' }}>
                  {selectedProduct.image ? (
                    <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                  ) : (
                    <HiCube className="text-4xl text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="font-bold mb-2" style={{ fontSize: '20px' }}>{selectedProduct.name}</h2>
                  <div className="space-y-1">
                    <div>
                      <span className="text-gray-500" style={{ fontSize: '14px' }}>In Stock </span>
                      <span className="text-black" style={{ fontSize: '14px' }}>{selectedProduct.quantity} items</span>
                    </div>
                    <div>
                      <span className="text-gray-500" style={{ fontSize: '14px' }}>Last Restock </span>
                      <span className="text-black" style={{ fontSize: '14px' }}>5 days ago</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Condition Section */}
              <div className="mb-6">
                <label className="block mb-2 text-gray-500" style={{ fontSize: '14px' }}>Condition</label>
                <CustomDropdown
                  value={selectedCondition}
                  onChange={(value) => setSelectedCondition(value)}
                  options={[
                    { value: 'Good', label: 'Good' },
                    { value: 'Warning', label: 'Warning' },
                    { value: 'Critical', label: 'Critical' },
                  ]}
                  className="w-full"
                />
              </div>

              {/* Misinformation Section */}
              <div className="mb-6">
                <h3 className="mb-2 text-gray-500 font-medium" style={{ fontSize: '16px' }}>Misinformation?</h3>
                <p className="mb-4 text-black" style={{ fontSize: '14px' }}>
                  Your input is valuable in helping us better understand your needs and tailor our service accordingly.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Inventory stock', 'Spoilage misread', 'Rerouting', 'Pricing'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleMisinformation(tag)}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: selectedMisinformation.includes(tag) ? '#B1D158' : '#D9D9D9',
                        color: '#000',
                        fontSize: '12px',
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Report Input */}
              <div className="mb-6">
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Add your report..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  rows={4}
                  style={{
                    borderRadius: '10px',
                    fontSize: '14px',
                  }}
                />
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendReport}
                className="w-full py-3 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: '#4A7450',
                  borderRadius: '10px',
                  fontSize: '15px',
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

