import React from 'react';
import { motion } from 'framer-motion';
import { FadeIn } from '../animations/FadeIn';
import { Globe, Clock, DollarSign, Briefcase } from 'lucide-react';

const benefits = [
  {
    icon: Globe,
    title: 'Work From Anywhere',
    description: 'Be your own boss and work from the comfort of your home or anywhere in the world.',
  },
  {
    icon: Clock,
    title: 'Flexible Hours',
    description: 'Set your own schedule and work when it suits you best.',
  },
  {
    icon: DollarSign,
    title: 'Set Your Rates',
    description: 'You decide how much to charge for your services and keep up to 80% of each transaction.',
  },
  {
    icon: Briefcase,
    title: 'Choose Your Projects',
    description: 'Work on projects that match your skills and interests.',
  },
];

export const SellerBenefits = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Sell on SkillCertified?
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <FadeIn key={benefit.title} delay={index * 0.1}>
              <motion.div
                className="bg-white rounded-lg p-6 shadow-lg"
                whileHover={{ y: -5 }}
              >
                <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};