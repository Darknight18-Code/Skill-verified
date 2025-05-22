import React from 'react';
import { motion } from 'framer-motion';
import { SkillCategory } from '../../data/skillCategories';
import { FadeIn } from '../animations/FadeIn';

interface SkillCategoryCardProps {
  category: SkillCategory;
  onSelect: (category: SkillCategory) => void;
}

export const SkillCategoryCard: React.FC<SkillCategoryCardProps> = ({ category, onSelect }) => {
  return (
    <FadeIn>
      <motion.div
        className="bg-white rounded-lg shadow-md overflow-hidden"
        whileHover={{ y: -5 }}
        onClick={() => onSelect(category)}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl">{category.icon}</span>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {category.skills.length} Skills
            </span>
          </div>
          
          <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
          <p className="text-gray-600 mb-4">{category.description}</p>
          
          <div className="space-y-2">
            <div className="text-sm text-gray-500">Available Tests:</div>
            {category.tests.map(test => (
              <div
                key={test.id}
                className="flex items-center justify-between bg-gray-50 p-2 rounded"
              >
                <span className="font-medium">{test.name}</span>
                <span className="text-sm text-gray-500">{test.duration}min</span>
              </div>
            ))}
          </div>
          
          <motion.button
            className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Certification
          </motion.button>
        </div>
      </motion.div>
    </FadeIn>
  );
};