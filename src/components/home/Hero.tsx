import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Award, Users } from 'lucide-react';
import { FadeIn } from '../animations/FadeIn';
import { ParallaxSection } from '../animations/ParallaxSection';

export const Hero = () => {
  return (
    <ParallaxSection imageUrl="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2850&q=80">
      <div className="bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                    Find Certified Freelancers for Your Next Project
                  </h1>
                </motion.div>
              </FadeIn>
              
              <FadeIn delay={0.2}>
                <p className="text-xl mb-8 text-indigo-100">
                  Connect with skilled professionals who have proven their expertise through our certification system.
                </p>
              </FadeIn>

              <FadeIn delay={0.4}>
                <div className="flex space-x-4">
                  <motion.button
                    className="bg-white text-indigo-600 px-6 py-3 rounded-md font-semibold flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Hire Talent <ArrowRight className="ml-2 h-5 w-5" />
                  </motion.button>
                  
                  <motion.button
                    className="border-2 border-white px-6 py-3 rounded-md font-semibold flex items-center"
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 1)', color: '#4F46E5' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Become a Freelancer
                  </motion.button>
                </div>
              </FadeIn>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Shield, title: 'Verified Skills', description: 'All freelancers are tested and certified in their expertise' },
                { icon: Award, title: 'Top Talent', description: 'Access to the best professionals in their fields' },
                { icon: Users, title: 'AI Matching', description: 'Smart algorithms to find the perfect match' }
              ].map((feature, index) => (
                <FadeIn key={feature.title} delay={0.2 * (index + 1)}>
                  <motion.div
                    className="bg-white/10 p-6 rounded-lg backdrop-blur-lg"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                  >
                    <feature.icon className="h-10 w-10 mb-4 text-indigo-300" />
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-indigo-100">{feature.description}</p>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ParallaxSection>
  );
};