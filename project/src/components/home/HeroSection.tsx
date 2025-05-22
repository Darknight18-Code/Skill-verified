import React from 'react';
import { motion } from 'framer-motion';
import { SearchBar } from './SearchBar';
import { ParallaxSection } from '../animations/ParallaxSection';
import { FadeIn } from '../animations/FadeIn';

export const HeroSection = () => {
  return (
    <ParallaxSection imageUrl="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2850&q=80">
      <div className="bg-gradient-to-r from-indigo-600/90 to-purple-600/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <FadeIn>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
                Find the Perfect Certified Freelancer
              </h1>
            </FadeIn>
            
            <FadeIn delay={0.2}>
              <p className="text-xl text-indigo-100 mb-8">
                Connect with verified professionals who have proven their expertise
              </p>
            </FadeIn>

            <FadeIn delay={0.4}>
              <SearchBar />
            </FadeIn>

            <FadeIn delay={0.6}>
              <div className="mt-12 flex justify-center space-x-8 text-white">
                {[
                  { label: 'Verified Freelancers', value: '50,000+' },
                  { label: 'Completed Projects', value: '100,000+' },
                  { label: 'Client Satisfaction', value: '4.8/5' },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-indigo-200">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </ParallaxSection>
  );
};