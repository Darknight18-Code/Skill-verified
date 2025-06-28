import React from 'react';
import { motion } from 'framer-motion';
import { Github, Chrome } from 'lucide-react';

interface SocialAuthButtonProps {
  provider: 'google' | 'github';
  onClick: () => void;
}

export const SocialAuthButton: React.FC<SocialAuthButtonProps> = ({ provider, onClick }) => {
  const icons = {
    google: Chrome,
    github: Github,
  };

  const labels = {
    google: 'Continue with Google',
    github: 'Continue with GitHub',
  };

  const colors = {
    google: 'hover:bg-red-50 border-red-200',
    github: 'hover:bg-gray-50 border-gray-200',
  };

  const Icon = icons[provider];

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-md border ${colors[provider]} transition-colors`}
    >
      <Icon className="h-5 w-5" />
      <span>{labels[provider]}</span>
    </motion.button>
  );
};