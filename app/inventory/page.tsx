'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { retailAPI } from '@/lib/api';
import NavBar from '@/components/NavBar';
import StatusBadge from '@/components/StatusBadge';
import { HiCube, HiArrowLeft, HiChevronDown, HiX } from 'react-icons/hi';
import { useHydration } from '@/lib/useHydration';

interface InventoryItem {
  id: string;
  commodity?: {
    name: string;
  };
  quantity: number;
  status: 'Good' | 'Warning' | 'Critical';
  image?: string;
}

function InventoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter');
  const { user, _hasHydrated } = useAuthStore();
  const hasHydrated = useHydration();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string>('Good');
  const [selectedMisinformation, setSelectedMisinformation] = useState<string[]>([]);
  const [reportText, setReportText] = useState('');

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

  // Helper function to get image path for product names
  const getProductImage = (productName: string): string | undefined => {
    const imageMap: { [key: string]: string } = {
      'Pomegranate': '/Pomegranate.png',
      'Rib Eye': '/Rib.png',
      'Spinach': '/Spinach.png',
      'Zucchini': '/Zucchini.png',
    };
    return imageMap[productName];
  };

  // Mock data for inventory
  const getMockInventoryData = () => {
    const allItems: InventoryItem[] = [
      { id: '1', commodity: { name: 'Pomegranate' }, quantity: 20, status: 'Good', image: '/Pomegranate.png' },
      { id: '2', commodity: { name: 'Rib Eye' }, quantity: 40, status: 'Good', image: '/Rib.png' },
      { id: '3', commodity: { name: 'Spinach' }, quantity: 0, status: 'Critical', image: '/Spinach.png' },
      { id: '4', commodity: { name: 'Zucchini' }, quantity: 4, status: 'Warning', image: '/Zucchini.png' },
      { id: '5', commodity: { name: 'Apple' }, quantity: 15, status: 'Good' },
      { id: '6', commodity: { name: 'Banana' }, quantity: 8, status: 'Warning' },
      { id: '7', commodity: { name: 'Orange' }, quantity: 25, status: 'Good' },
      { id: '8', commodity: { name: 'Strawberry' }, quantity: 3, status: 'Warning' },
    ];

    if (filter === 'low-stock') {
      return allItems.filter(item => item.quantity > 0 && item.quantity <= 5);
    } else if (filter === 'out-of-stock') {
      return allItems.filter(item => item.quantity === 0);
    } else {
      return allItems;
    }
  };

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
      
      const items: InventoryItem[] = (data.data || []).map((item: any) => {
        const productName = item.commodity?.name || '';
        return {
          id: item.id,
          commodity: item.commodity,
          quantity: item.quantity || 0,
          status:
            item.quantity > 10
              ? 'Good'
              : item.quantity > 0
              ? 'Warning'
              : 'Critical',
          image: getProductImage(productName),
        };
      });

      // Use mock data if API returns empty or has unknown items
      if (items.length === 0 || items.some(item => !item.commodity?.name)) {
        setInventory(getMockInventoryData());
      } else {
        setInventory(items);
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
      setInventory(getMockInventoryData());
    } finally {
      setLoading(false);
    }
  };

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
      product: selectedProduct.commodity?.name,
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
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 
            className="font-semibold"
            style={{ fontSize: '25px' }}
          >
            {filter === 'low-stock'
              ? 'Low On Stock'
              : filter === 'out-of-stock'
              ? 'Out Of Stock'
              : 'Inventory'}
          </h1>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2.5 font-medium bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm hover:shadow"
            style={{ 
              borderRadius: '10px',
              fontSize: '15px',
              color: '#374151'
            }}
          >
            <HiArrowLeft className="mr-2" size={18} />
            Back to Home
          </Link>
        </div>

        <div className="space-y-3">
          {inventory.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center shadow-md">
              <p className="text-gray-500">No items found</p>
            </div>
          ) : (
            inventory.map((item) => (
              <div
                key={item.id}
                onClick={() => handleProductClick(item)}
                className="bg-white rounded-lg p-4 shadow-md flex items-center justify-between cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100" style={{ borderRadius: '12px' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.commodity?.name || ''} className="w-full h-full object-cover" />
                    ) : (
                      <HiCube className="text-2xl text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {item.commodity?.name || ''}
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
              </div>
            ))
          )}
        </div>
      </div>
      <NavBar />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 z-[10000] flex items-end"
          onClick={handleCloseModal}
        >
          {/* Blur Background */}
          <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"></div>
          
          {/* Modal Content */}
          <div 
            className="relative w-full bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
            }}
          >
            {/* Header with Close Button */}
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 pt-4 pb-2 border-b border-gray-200">
              <div className="flex-1"></div>
              <div className="flex-1 flex justify-center">
                <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
              </div>
              <div className="flex-1 flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close modal"
                >
                  <HiX className="text-2xl text-gray-600" />
                </button>
              </div>
            </div>

            <div className="px-6 pb-8">
              {/* Product Info */}
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-24 h-24 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100 flex-shrink-0" style={{ borderRadius: '12px' }}>
                  {selectedProduct.image ? (
                    <img src={selectedProduct.image} alt={selectedProduct.commodity?.name || ''} className="w-full h-full object-cover" />
                  ) : (
                    <HiCube className="text-4xl text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="font-bold mb-2" style={{ fontSize: '20px' }}>{selectedProduct.commodity?.name || ''}</h2>
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

export default function InventoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <InventoryContent />
    </Suspense>
  );
}

