import React, { useState } from 'react';
import { Slider } from '../ui/Slider';
import { Star, ChevronDown, ChevronUp, Clock, DollarSign, Zap } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const SearchFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [rating, setRating] = useState(4);
  const [deliveryTime, setDeliveryTime] = useState<string | null>(null);
  
  // Filter section states
  const [openSections, setOpenSections] = useState({
    budget: true,
    sellerDetails: true,
    deliveryTime: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterApply = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('minPrice', priceRange[0].toString());
    newParams.set('maxPrice', priceRange[1].toString());
    newParams.set('minRating', rating.toString());
    
    if (deliveryTime) {
      newParams.set('deliveryTime', deliveryTime);
    } else {
      newParams.delete('deliveryTime');
    }
    
    setSearchParams(newParams);
  };

  const handleDeliveryTimeChange = (value: string) => {
    setDeliveryTime(deliveryTime === value ? null : value);
  };

  return (
    <div className="bg-white rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>

      <div className="space-y-4 divide-y divide-gray-100">
        {/* Budget Filter */}
        <div className="py-3">
          <button 
            onClick={() => toggleSection('budget')}
            className="flex justify-between items-center w-full text-left mb-2"
          >
            <h3 className="text-md font-medium">Budget</h3>
            {openSections.budget ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {openSections.budget && (
            <div className="mt-3 space-y-3">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">${priceRange[0]} - ${priceRange[1]}</span>
              </div>
              <Slider
                min={0}
                max={1000}
                step={10}
                value={priceRange}
                onChange={(value: [number, number]) => setPriceRange(value)}
              />
            </div>
          )}
        </div>

        {/* Seller Details Filter */}
        <div className="py-3">
          <button 
            onClick={() => toggleSection('sellerDetails')}
            className="flex justify-between items-center w-full text-left mb-2"
          >
            <h3 className="text-md font-medium">Seller Details</h3>
            {openSections.sellerDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {openSections.sellerDetails && (
            <div className="mt-3 space-y-3">
              <div>
                <h4 className="text-sm text-gray-500 mb-2">Seller Level</h4>
                <div className="space-y-2">
                  {['Top Rated', 'Level 2', 'Level 1', 'New Seller'].map((level) => (
                    <label key={level} className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className="ml-2 text-sm text-gray-600">{level}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm text-gray-500 mb-2">Minimum Rating</h4>
                <div className="flex items-center justify-between space-x-2 px-1">
                  {[5, 4, 3, 2, 1].map((value) => (
                    <button
                      key={value}
                      onClick={() => setRating(value)}
                      className={`flex items-center space-x-1 p-1 ${rating >= value ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      <Star className="h-5 w-5 fill-current" />
                      <span className="text-xs text-gray-600">{value}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delivery Time Filter */}
        <div className="py-3">
          <button 
            onClick={() => toggleSection('deliveryTime')}
            className="flex justify-between items-center w-full text-left mb-2"
          >
            <h3 className="text-md font-medium">Delivery Time</h3>
            {openSections.deliveryTime ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {openSections.deliveryTime && (
            <div className="mt-3 space-y-2">
              {[
                { value: '1', label: 'Express 24H', icon: Zap },
                { value: '3', label: 'Up to 3 days', icon: Clock },
                { value: '7', label: 'Up to 7 days', icon: Clock }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDeliveryTimeChange(option.value)}
                  className={`flex items-center w-full py-1.5 px-2 rounded-md ${
                    deliveryTime === option.value 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <option.icon className="h-4 w-4 mr-2" />
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <button 
        onClick={handleFilterApply}
        className="w-full mt-5 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
      >
        Apply Filters
      </button>
      
      <button 
        onClick={() => {
          setPriceRange([0, 1000]);
          setDeliveryTime(null);
          setRating(4);
        }}
        className="w-full mt-2 bg-white text-gray-700 py-2 px-4 border rounded-md hover:bg-gray-50 transition-colors"
      >
        Clear All
      </button>
    </div>
  );
};