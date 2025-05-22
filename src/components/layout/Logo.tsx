import React from 'react';
import { Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LogoProps {
  isScrolled?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ isScrolled = false }) => {
  return (
    <Link to="/" className={`flex items-center space-x-2 ${isScrolled ? 'text-indigo-600' : 'text-white'}`}>
      <Briefcase className="h-8 w-8" />
      <span className="text-xl font-bold">SkillVerified</span>
    </Link>
  );
};