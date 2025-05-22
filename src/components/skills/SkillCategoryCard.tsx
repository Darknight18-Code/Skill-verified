import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SkillCategory, Skill } from '../../data/skillCategories';
import { FadeIn } from '../animations/FadeIn';
import { ArrowRight, X } from 'lucide-react';

interface SkillCategoryCardProps {
  category: SkillCategory;
  onSelect: (category: SkillCategory) => void;
}

export const SkillCategoryCard: React.FC<SkillCategoryCardProps> = ({ category, onSelect }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedStack, setSelectedStack] = useState<Skill | null>(null);

  // Show only tests that match the selected tech stack (by id)
  const filteredTests = selectedStack
    ? category.tests.filter(test => test.id.includes(selectedStack.id))
    : [];

  const handleViewTests = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStack(null);
  };

  const handleSelectStack = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const skillId = e.target.value;
    const skill = category.skills.find(s => s.id === skillId) || null;
    setSelectedStack(skill);
  };

  const handleProceedToTest = (testId: string) => {
    navigate(`/skills/category/${category.id}/tests/${testId}`);
    setShowModal(false);
    setSelectedStack(null);
  };

  // Modal content as a separate variable for portal rendering
  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 relative animate-fade-in flex flex-col"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={handleCloseModal}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold mb-4 text-center">Choose Tech Stack</h2>
        <select
          className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={selectedStack?.id || ''}
          onChange={handleSelectStack}
          autoFocus
        >
          <option value="" disabled>
            Select a tech stack
          </option>
          {category.skills.map(skill => (
            <option key={skill.id} value={skill.id}>
              {skill.name}
            </option>
          ))}
        </select>
        {selectedStack && (
          <div>
            <h3 className="font-semibold mb-2 text-center">Available Tests for {selectedStack.name}</h3>
            {filteredTests.length > 0 ? (
              <ul className="space-y-2">
                {filteredTests.map(test => (
                  <li key={test.id} className="flex items-center justify-between bg-gray-50 rounded p-2">
                    <span>{test.name}</span>
                    <button
                      className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 text-sm"
                      onClick={() => handleProceedToTest(test.id)}
                    >
                      Take Test
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500 text-sm text-center">No tests available for this tech stack.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <FadeIn>
      <motion.div
        className="bg-white rounded-lg shadow-md overflow-hidden"
        whileHover={{ y: -5 }}
        onClick={() => onSelect(category)}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl">{category.icon}</span>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {category.skills.length} Skills
            </span>
          </div>
          <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
          <p className="text-gray-600 mb-4">{category.description}</p>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {category.tests.length} {category.tests.length === 1 ? 'Test' : 'Tests'} Available
            </div>
            <motion.button
              onClick={handleViewTests}
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View Tests
              <ArrowRight className="ml-2 h-4 w-4" />
            </motion.button>
          </div>
        </div>
        {/* Modal rendered via React Portal */}
        {showModal && createPortal(modalContent, document.body)}
      </motion.div>
    </FadeIn>
  );
};