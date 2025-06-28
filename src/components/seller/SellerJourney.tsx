import React from 'react';
import { motion } from 'framer-motion';
import { FadeIn } from '../animations/FadeIn';
import { UserPlus, Package, MessageSquare, CheckCircle, CreditCard } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Create Your Profile',
    description: 'Set up your professional profile highlighting your skills and experience.',
  },
  {
    icon: Package,
    title: 'Create Your Services',
    description: 'List your services with detailed descriptions and competitive pricing.',
  },
  {
    icon: MessageSquare,
    title: 'Receive Orders',
    description: 'Get notified when clients are interested in your services.',
  },
  {
    icon: CheckCircle,
    title: 'Deliver Quality Work',
    description: 'Complete projects and build your reputation with great reviews.',
  },
  {
    icon: CreditCard,
    title: 'Get Paid',
    description: 'Receive secure payments directly to your preferred payment method.',
  },
];

export const SellerJourney = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="text-3xl font-bold text-center mb-12">
            Your Journey to Success
          </h2>
        </FadeIn>

        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-indigo-100 -translate-y-1/2 hidden lg:block" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <FadeIn key={step.title} delay={index * 0.1}>
                <motion.div
                  className="relative bg-white rounded-lg p-6 shadow-lg"
                  whileHover={{ y: -5 }}
                >
                  <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-center">{step.title}</h3>
                  <p className="text-gray-600 text-center">{step.description}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};