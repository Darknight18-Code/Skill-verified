import { useState, useEffect } from 'react';

export const useAuthModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Only show modal if user is not already authenticated
      const hasAuthToken = localStorage.getItem('auth_token');
      if (!hasAuthToken) {
        setIsOpen(true);
      }
    }, 45000); // 45 seconds

    return () => clearTimeout(timer);
  }, []);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return {
    isOpen,
    openModal,
    closeModal,
  };
};