'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import NavBar from '@/components/NavBar';
import { useHydration } from '@/lib/useHydration';
import { HiChevronDown } from 'react-icons/hi';

interface NewEntryForm {
  productName: string;
  stock: string;
  stockUnit: string;
  date: string;
  route: string;
  currency: string;
  retailPrice: string;
  priceUnit: string;
}

export default function AddPage() {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();
  const hasHydrated = useHydration();
  const [formData, setFormData] = useState<NewEntryForm>({
    productName: '',
    stock: '',
    stockUnit: 'kg',
    date: '1 May 2025',
    route: 'Jam',
    currency: 'USD',
    retailPrice: '',
    priceUnit: 'kg',
  });

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

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleInputChange = (field: keyof NewEntryForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const CustomDropdown = ({ 
    value, 
    onChange, 
    options, 
    className = '',
    minWidth = '80px'
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
          className="w-full px-3 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent flex items-center justify-between"
          style={{ 
            color: '#000',
            borderRadius: '10px',
            fontSize: '15px'
          }}
        >
          <span className="truncate">{selectedOption?.label || value}</span>
          <HiChevronDown 
            className={`flex-shrink-0 ml-2 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            size={18}
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
                style={{ fontSize: '15px' }}
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
          className="mb-6 font-semibold"
          style={{ fontSize: '25px' }}
        >
          New entry
        </h1>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-md p-6" style={{ borderRadius: '20px' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Product name */}
            <div>
              <label className="block mb-2 font-medium" style={{ fontSize: '15px', color: '#374151' }}>
                Product name
              </label>
              <input
                type="text"
                placeholder="Type here..."
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                style={{ 
                  color: '#000',
                  borderRadius: '10px',
                  fontSize: '15px'
                }}
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block mb-2 font-medium" style={{ fontSize: '15px', color: '#374151' }}>
                Stock
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type here..."
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  className="flex-1 min-w-0 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  style={{ 
                    color: '#000',
                    borderRadius: '10px',
                    fontSize: '15px'
                  }}
                />
                <div className="flex-shrink-0" style={{ width: '90px' }}>
                  <CustomDropdown
                    value={formData.stockUnit}
                    onChange={(value) => handleInputChange('stockUnit', value)}
                    options={[
                      { value: 'kg', label: 'kg' },
                      { value: 'g', label: 'g' },
                      { value: 'items', label: 'items' },
                    ]}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block mb-2 font-medium" style={{ fontSize: '15px', color: '#374151' }}>
                Date
              </label>
              <CustomDropdown
                value={formData.date}
                onChange={(value) => handleInputChange('date', value)}
                options={[
                  { value: '1 May 2025', label: '1 May 2025' },
                  { value: '2 May 2025', label: '2 May 2025' },
                  { value: '3 May 2025', label: '3 May 2025' },
                ]}
              />
            </div>

            {/* Route */}
            <div>
              <label className="block mb-2 font-medium" style={{ fontSize: '15px', color: '#374151' }}>
                Route
              </label>
              <CustomDropdown
                value={formData.route}
                onChange={(value) => handleInputChange('route', value)}
                options={[
                  { value: 'Jam', label: 'Jam' },
                  { value: 'Bandung', label: 'Bandung' },
                  { value: 'Jakarta', label: 'Jakarta' },
                ]}
              />
            </div>

            {/* Retail price */}
            <div>
              <label className="block mb-2 font-medium" style={{ fontSize: '15px', color: '#374151' }}>
                Retail price
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex-shrink-0" style={{ width: '90px' }}>
                  <CustomDropdown
                    value={formData.currency}
                    onChange={(value) => handleInputChange('currency', value)}
                    options={[
                      { value: 'USD', label: 'USD' },
                      { value: 'IDR', label: 'IDR' },
                      { value: 'EUR', label: 'EUR' },
                    ]}
                    className="w-full"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Type here..."
                  value={formData.retailPrice}
                  onChange={(e) => handleInputChange('retailPrice', e.target.value)}
                  className="flex-1 min-w-0 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  style={{ 
                    color: '#000',
                    borderRadius: '10px',
                    fontSize: '15px'
                  }}
                />
                <span className="text-gray-600 flex-shrink-0" style={{ fontSize: '15px' }}>/</span>
                <div className="flex-shrink-0" style={{ width: '90px' }}>
                  <CustomDropdown
                    value={formData.priceUnit}
                    onChange={(value) => handleInputChange('priceUnit', value)}
                    options={[
                      { value: 'kg', label: 'kg' },
                      { value: 'g', label: 'g' },
                      { value: 'items', label: 'items' },
                    ]}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="px-8 py-3 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: '#4A7450',
                  borderRadius: '10px',
                  fontSize: '15px'
                }}
              >
                Post
              </button>
            </div>
          </form>
        </div>
      </div>
      <NavBar />
    </div>
  );
}

