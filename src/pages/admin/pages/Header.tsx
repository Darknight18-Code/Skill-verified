// No React import needed with modern JSX transform
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export const AdminHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Briefcase className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold">Admin Portal</span>
          </Link>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Admin Access</span>
          </div>
        </div>
      </nav>
    </header>
  );
};