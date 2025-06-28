import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxSectionProps {
  imageUrl: string;
  children: React.ReactNode;
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({ imageUrl, children }) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <div className="relative overflow-hidden">
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          y,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};