import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { skillCategories } from '../../data/skillCategories';

export const CategoryNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';

  console.log('CategoryNav rendered with current category:', currentCategory);

  const handleCategoryClick = (categoryId: string) => {
    console.log('Category clicked:', categoryId);
    console.log('Current URL before navigation:', location.pathname + location.search);
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('category', categoryId);
    const newUrl = `?${newParams.toString()}`;
    console.log('Navigating to URL:', newUrl);
    
    navigate(newUrl);
  };

  return (
    <div className="py-4">
      <div className="flex overflow-x-auto hide-scrollbar space-x-6 py-2">
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleCategoryClick('all')}
          className={`flex flex-col items-center min-w-[80px] transition-colors ${
            currentCategory === 'all'
              ? 'text-indigo-600 font-medium'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 mb-2">
            <span className="text-xl">🌐</span>
          </div>
          <span className="text-xs whitespace-nowrap">All Categories</span>
        </motion.button>

        {skillCategories.map((category) => (
          <motion.button
            key={category.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCategoryClick(category.id)}
            className={`flex flex-col items-center min-w-[80px] transition-colors ${
              currentCategory === category.id
                ? 'text-indigo-600 font-medium'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 mb-2">
              <span className="text-xl">{category.icon}</span>
            </div>
            <span className="text-xs whitespace-nowrap">{category.name}</span>
          </motion.button>
        ))}
      </div>
      <style>
        {`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        `}
      </style>
    </div>
  );
};