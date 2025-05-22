import React from 'react';
import { motion } from 'framer-motion';
import { Code, Paintbrush, Smartphone, PenTool, Video, MessageSquare } from 'lucide-react';
import { FadeIn } from '../animations/FadeIn';
import { Link } from 'react-router-dom';

const services = [
  {
    icon: Code,
    title: 'Web Development',
    description: 'Custom websites and web applications',
    color: 'bg-blue-500',
    id: 'web-development',
  },
  {
    icon: Paintbrush,
    title: 'UI/UX Design',
    description: 'Beautiful and intuitive interfaces',
    color: 'bg-purple-500',
    id: 'ui-ux-design',
  },
  {
    icon: Smartphone,
    title: 'Mobile Development',
    description: 'iOS and Android applications',
    color: 'bg-green-500',
    id: 'mobile-development',
  },
  {
    icon: PenTool,
    title: 'Logo Design',
    description: 'Professional brand identity',
    color: 'bg-yellow-500',
    id: 'logo-design',
  },
  {
    icon: Video,
    title: 'Video Editing',
    description: 'Professional video production',
    color: 'bg-red-500',
    id: 'video-editing',
  },
  {
    icon: MessageSquare,
    title: 'Content Writing',
    description: 'Engaging articles and copy',
    color: 'bg-indigo-500',
    id: 'content-writing',
  },
];

export const PopularServices = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="text-3xl font-bold text-center mb-12">Popular Services</h2>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <FadeIn key={service.title} delay={index * 0.1}>
              <Link to={`/explore/${service.id}`}>
                <motion.div
                  className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer"
                  whileHover={{ y: -5 }}
                >
                  <div className={`${service.color} p-6`}>
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                    <p className="text-gray-600">{service.description}</p>
                    <motion.button
                      className="mt-4 text-indigo-600 font-medium hover:text-indigo-700"
                      whileHover={{ x: 5 }}
                    >
                      Learn More →
                    </motion.button>
                  </div>
                </motion.div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
