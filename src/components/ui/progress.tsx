import React from 'react';
import { LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';

interface ProgressProps {
  value: number;
  className?: string;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  variant?: 'determinate' | 'indeterminate' | 'buffer' | 'query';
  height?: number;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  className = '',
  color = 'primary',
  variant = 'determinate',
  height = 8,
}) => {
  const progressStyles = {
    borderRadius: '4px',
    height: `${height}px`,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    '& .MuiLinearProgress-bar': {
      borderRadius: '4px',
      transition: 'transform 0.3s ease-in-out',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <LinearProgress
        variant={variant}
        color={color}
        value={value}
        sx={progressStyles}
      />
    </motion.div>
  );
}; 