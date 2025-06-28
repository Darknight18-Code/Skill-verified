import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock } from 'lucide-react';
import { FadeIn } from '../animations/FadeIn';

const freelancers = [
  {
    id: 1,
    name: 'Alex Thompson',
    title: 'Senior Full Stack Developer',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews: 127,
    hourlyRate: 85,
    location: 'San Francisco, CA',
    responseTime: '< 1 hour',
    skills: ['React', 'Node.js', 'TypeScript'],
    certifications: ['AWS', 'MongoDB'],
  },
  {
    id: 2,
    name: 'Sarah Chen',
    title: 'UI/UX Designer',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 89,
    hourlyRate: 75,
    location: 'New York, NY',
    responseTime: '< 2 hours',
    skills: ['Figma', 'Adobe XD', 'Sketch'],
    certifications: ['Google UX Design'],
  },
  {
    id: 3,
    name: 'David Kim',
    title: 'Mobile Developer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80',
    rating: 4.8,
    reviews: 156,
    hourlyRate: 90,
    location: 'Seattle, WA',
    responseTime: '< 1 hour',
    skills: ['React Native', 'iOS', 'Android'],
    certifications: ['Apple Developer', 'Google Developer'],
  },
];

export const FreelancerGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {freelancers.map((freelancer, index) => (
        <FadeIn key={freelancer.id} delay={index * 0.1}>
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <img
                  src={freelancer.image}
                  alt={freelancer.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm font-medium">{freelancer.rating}</span>
                  <span className="ml-1 text-sm text-gray-500">({freelancer.reviews})</span>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-1">{freelancer.name}</h3>
              <p className="text-gray-600 mb-4">{freelancer.title}</p>

              <div className="flex items-center text-sm text-gray-500 mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                {freelancer.location}
                <Clock className="h-4 w-4 ml-4 mr-1" />
                {freelancer.responseTime}
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {freelancer.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-indigo-600">${freelancer.hourlyRate}</span>
                  <span className="text-gray-500">/hr</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  View Profile
                </motion.button>
              </div>
            </div>
          </motion.div>
        </FadeIn>
      ))}
    </div>
  );
};