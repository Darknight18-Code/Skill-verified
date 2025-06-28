import React from 'react';
import { motion } from 'framer-motion';

interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export const Slider: React.FC<SliderProps> = ({ min, max, step, value, onChange }) => {
  const [isDragging, setIsDragging] = React.useState<number | null>(null);

  const handleMouseDown = (index: number) => {
    setIsDragging(index);
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging === null) return;

    const slider = e.currentTarget.getBoundingClientRect();
    const percent = Math.min(Math.max((e.clientX - slider.left) / slider.width, 0), 1);
    const newValue = Math.round((percent * (max - min) + min) / step) * step;

    const newValues = [...value] as [number, number];
    newValues[isDragging] = newValue;

    if (isDragging === 0 && newValue < value[1]) {
      onChange(newValues);
    } else if (isDragging === 1 && newValue > value[0]) {
      onChange(newValues);
    }
  };

  return (
    <div
      className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="absolute h-full bg-indigo-600 rounded-full"
        style={{
          left: `${((value[0] - min) / (max - min)) * 100}%`,
          right: `${100 - ((value[1] - min) / (max - min)) * 100}%`,
        }}
      />
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md cursor-grab active:cursor-grabbing"
          style={{
            left: `${((value[i] - min) / (max - min)) * 100}%`,
          }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onMouseDown={() => handleMouseDown(i)}
        />
      ))}
    </div>
  );
};