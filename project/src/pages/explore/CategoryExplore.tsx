import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FadeIn } from '../../components/animations/FadeIn';
import { skillCategories } from '../../data/skillCategories';
import { FreelancerGrid } from '../../components/explore/FreelancerGrid';
import { SearchFilters } from '../../components/explore/SearchFilters';

export const CategoryExplore = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = skillCategories.find(cat => cat.id === categoryId);

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-2xl font-bold text-gray-900">Category not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-300 pt-16">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-4xl">{category.icon}</span>
              <h1 className="text-4xl font-bold">{category.name}</h1>
            </div>
            <p className="text-xl text-indigo-100">{category.description}</p>
          </FadeIn>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {category.skills.map(skill => (
              <FadeIn key={skill.id}>
                <motion.div
                  className="bg-white/10 backdrop-blur-lg rounded-lg p-4"
                  whileHover={{ scale: 1.05 }}
                >
                  <h3 className="font-semibold mb-1">{skill.name}</h3>
                  <p className="text-sm text-indigo-100">{skill.description}</p>
                  <span className="inline-block mt-2 text-xs bg-indigo-500 px-2 py-1 rounded">
                    {skill.level}
                  </span>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <SearchFilters />
          </div>
          <div className="lg:col-span-3">
            <FreelancerGrid />
          </div>
        </div>
      </div>
    </div>
  );
};