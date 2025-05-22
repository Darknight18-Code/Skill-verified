import React from 'react';
import { motion } from 'framer-motion';
import { Code, Paintbrush, Smartphone, PenTool, Video, MessageSquare } from 'lucide-react';

const categories = [
  { icon: Code, name: 'Development' },
  { icon: Paintbrush, name: 'Design' },
  { icon: Smartphone, name: 'Mobile' },
  { icon: PenTool, name: 'Logo Design' },
  { icon: Video, name: 'Video' },
  { icon: MessageSquare, name: 'Writing' },
];

export const CategoryNav = () => {
  const [activeCategory, setActiveCategory] = React.useState('Development');

  return (
    <div className="flex overflow-x-auto space-x-4 pb-4 mb-6">
      {categories.map((category) => (
        <motion.button
          key={category.name}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveCategory(category.name)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap ${
            activeCategory === category.name
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <category.icon className="h-4 w-4" />
          <span>{category.name}</span>
        </motion.button>
      ))}
    </div>
  );
};