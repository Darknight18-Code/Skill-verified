import React from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

const popularSearches = [
  'Web Development',
  'Mobile Apps',
  'Logo Design',
  'AI Development',
  'Content Writing',
];

export const SearchBar = () => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          placeholder="Search for any service..."
          className="w-full px-4 py-3 pl-12 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-md"
        >
          Search
        </motion.button>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-3">
        {popularSearches.map((search) => (
          <motion.button
            key={search}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200"
          >
            {search}
          </motion.button>
        ))}
      </div>
    </div>
  );
};