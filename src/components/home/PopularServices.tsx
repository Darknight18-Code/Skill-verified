import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Code, Paintbrush, Smartphone, PenTool, Video, MessageSquare } from 'lucide-react';
import { FadeIn } from '../animations/FadeIn';
import { SignInRequiredModal } from '../auth/SignInRequiredModal';
import { skillCategories } from '../../data/skillCategories';

// Map service titles to category IDs for navigation
const serviceCategoryMap: Record<string, string> = {
  'Web Development': 'web-development',
  'UI/UX Design': 'ui-ux-design',
  'Mobile Development': 'mobile-development',
  'Graphic Design': 'graphic-design',
  'Video Editing': 'video-editing',
  'Content Writing': 'content-writing',
};

const services = [
  {
    icon: Code,
    title: 'Web Development',
    description: 'Custom websites and web applications',
    color: 'bg-blue-500',
  },
  {
    icon: Paintbrush,
    title: 'UI/UX Design',
    description: 'Beautiful and intuitive interfaces',
    color: 'bg-purple-500',
  },
  {
    icon: Smartphone,
    title: 'Mobile Development',
    description: 'iOS and Android applications',
    color: 'bg-green-500',
  },
  {
    icon: Paintbrush,
    title: 'Graphic Design',
    description: 'Creative visual solutions for your brand',
    color: 'bg-yellow-500',
  },
  {
    icon: Video,
    title: 'Video Editing',
    description: 'Professional video production',
    color: 'bg-red-500',
  },
  {
    icon: MessageSquare,
    title: 'Content Writing',
    description: 'Engaging articles and copy',
    color: 'bg-indigo-500',
  },
];

export const PopularServices = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null);

  // Helper to get categoryId from service title
  const getCategoryId = (title: string) => {
    // Prefer mapping, fallback to matching skillCategories
    return serviceCategoryMap[title] || skillCategories.find(cat => cat.name.toLowerCase() === title.toLowerCase())?.id;
  };

  const handleCardClick = (title: string) => {
    const categoryId = getCategoryId(title);
    if (!categoryId) return;
    if (isSignedIn) {
      navigate(`/explore?category=${categoryId}`);
    } else {
      setPendingCategoryId(categoryId);
      setShowSignInModal(true);
    }
  };

  // After modal closes, if user is now signed in and there was a pending category, navigate
  const handleModalClose = () => {
    setShowSignInModal(false);
    if (isSignedIn && pendingCategoryId) {
      navigate(`/explore?category=${pendingCategoryId}`);
      setPendingCategoryId(null);
    }
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="text-3xl font-bold text-center mb-12">Popular Services</h2>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <FadeIn key={service.title} delay={index * 0.1}>
              <motion.div
                className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer"
                whileHover={{ y: -5 }}
                onClick={() => handleCardClick(service.title)}
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
                    onClick={e => { e.stopPropagation(); handleCardClick(service.title); }}
                  >
                    Learn More →
                  </motion.button>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
        {showSignInModal && <SignInRequiredModal onClose={handleModalClose} />}
      </div>
    </section>
  );
};