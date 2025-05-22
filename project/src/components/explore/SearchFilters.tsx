import React from 'react';
import { Slider } from '../ui/Slider';
import { Star, DollarSign, Award, Clock } from 'lucide-react';

export const SearchFilters = () => {
  const [priceRange, setPriceRange] = React.useState([0, 1000]);
  const [rating, setRating] = React.useState(4);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-6">Filters</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">Price Range</h3>
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">${priceRange[0]} - ${priceRange[1]}</span>
          </div>
          <Slider
            min={0}
            max={1000}
            step={10}
            value={priceRange}
            onChange={setPriceRange}
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">Minimum Rating</h3>
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-400" />
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value}+ Stars
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">Certifications</h3>
          <div className="space-y-2">
            {['Web Development', 'UI/UX Design', 'Mobile Development', 'Digital Marketing'].map((cert) => (
              <label key={cert} className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="ml-2 text-sm text-gray-600">{cert}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">Response Time</h3>
          <div className="space-y-2">
            {[
              { label: '< 1 hour', icon: Clock },
              { label: '< 6 hours', icon: Clock },
              { label: '< 24 hours', icon: Clock }
            ].map((time) => (
              <label key={time.label} className="flex items-center">
                <input type="radio" name="response-time" className="border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                <time.icon className="h-4 w-4 text-gray-400 ml-2" />
                <span className="ml-2 text-sm text-gray-600">{time.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
          Apply Filters
        </button>
      </div>
    </div>
  );
};