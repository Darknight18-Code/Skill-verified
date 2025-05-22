import React from 'react';
import { SearchFilters } from '../components/explore/SearchFilters';
import { FreelancerGrid } from '../components/explore/FreelancerGrid';
import { CategoryNav } from '../components/explore/CategoryNav';
import { FadeIn } from '../components/animations/FadeIn';

export const Explore = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h1 className="text-4xl font-bold mb-4">Explore Top Freelancers</h1>
            <p className="text-xl text-indigo-100">Find the perfect certified professional for your project</p>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <SearchFilters />
          </div>
          <div className="lg:col-span-3">
            <CategoryNav />
            <FreelancerGrid />
          </div>
        </div>
      </div>
    </div>
  );
};