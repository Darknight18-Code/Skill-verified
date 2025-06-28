import React from 'react';
import { Paper } from '@mui/material';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevation?: number;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  elevation = 1,
  onClick,
  hoverable = false,
}) => {
  const baseStyles = {
    padding: '1.5rem',
    borderRadius: '0.5rem',
    transition: 'all 0.2s ease-in-out',
    cursor: onClick ? 'pointer' : 'default',
    height: '100%',
  };

  const hoverStyles = hoverable
    ? {
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
      }
    : {};

  return (
    <motion.div
      whileHover={hoverable ? { scale: 1.02 } : undefined}
      whileTap={hoverable ? { scale: 0.98 } : undefined}
    >
      <Paper
        elevation={elevation}
        sx={{ ...baseStyles, ...hoverStyles }}
        className={className}
        onClick={onClick}
      >
        {children}
      </Paper>
    </motion.div>
  );
}; 