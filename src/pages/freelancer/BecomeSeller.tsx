import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FadeIn } from '../../components/animations/FadeIn';
import { 
  Briefcase, 
  DollarSign, 
  Globe, 
  Users, 
  ArrowRight 
} from 'lucide-react';

export const BecomeSeller = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Briefcase,
      title: 'Find Work',
      description: 'Connect with clients looking for your skills and expertise.'
    },
    {
      icon: DollarSign,
      title: 'Earn Money',
      description: 'Set your own rates and get paid for your work.'
    },
    {
      icon: Globe,
      title: 'Work Anywhere',
      description: 'Work from anywhere in the world, on your own schedule.'
    },
    {
      icon: Users,
      title: 'Build Your Network',
      description: 'Connect with other freelancers and grow your professional network.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Become a Freelancer
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Join our community of talented freelancers and start earning money doing what you love.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-md bg-indigo-500 text-white">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-base text-gray-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/freelancer/register')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Start Earning Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}; 