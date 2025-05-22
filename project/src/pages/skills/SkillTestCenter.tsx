import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Award, Clock, CheckCircle, Search } from 'lucide-react';
import { FadeIn } from '../../components/animations/FadeIn';
import { useSkillTests } from '../../hooks/useSkillTests';
import { skillCategories, SkillCategory } from '../../data/skillCategories';
import { SkillCategoryCard } from '../../components/skills/SkillCategoryCard';

export const SkillTestCenter = () => {
  const { tests, loading } = useSkillTests();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<SkillCategory | null>(null);

  const stats = [
    { label: 'Available Tests', value: '45', icon: BookOpen, color: 'bg-blue-500' },
    { label: 'Certifications Issued', value: '8,745', icon: Award, color: 'bg-green-500' },
    { label: 'Average Time', value: '45m', icon: Clock, color: 'bg-yellow-500' },
    { label: 'Pass Rate', value: '76%', icon: CheckCircle, color: 'bg-purple-500' },
  ];

  const filteredCategories = skillCategories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h1 className="text-3xl font-bold mb-8">Skill Test Center</h1>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <FadeIn key={stat.label}>
              <motion.div
                className="bg-white rounded-lg shadow-md p-6"
                whileHover={{ y: -5 }}
              >
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{stat.label}</h3>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>

        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for skills or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCategories.map(category => (
            <SkillCategoryCard
              key={category.id}
              category={category}
              onSelect={setSelectedCategory}
            />
          ))}
        </div>
      </div>
    </div>
  );
};