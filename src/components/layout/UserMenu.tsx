import React, { useEffect, useState } from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface FreelancerData {
  isVerified: boolean;
}

export const UserMenu = () => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [freelancerData, setFreelancerData] = useState<FreelancerData | null>(null);

  useEffect(() => {
    const fetchFreelancerData = async () => {
      if (!user) return;
      
      try {
        const response = await axios.get(`/api/freelancers/${user.id}`);
        setFreelancerData(response.data);
      } catch (error) {
        // If 404, user is not a freelancer
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setFreelancerData(null);
        }
      }
    };

    fetchFreelancerData();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.menu-dropdown')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center space-x-4">
      {/* Only show menu dropdown if user is a registered freelancer */}
      {freelancerData && (
        <div className="relative menu-dropdown">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
          >
            <span>Menu</span>
            <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
              {/* <Link to="/freelancer/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Dashboard
              </Link> */}
              <Link to="/freelancer/gigs/create" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Create a Gig
              </Link>
              <Link to="/freelancer/gigs" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                My Gigs
              </Link>
              {!freelancerData.isVerified && (
                <div className="px-4 py-2 text-xs text-yellow-600 bg-yellow-50">
                  Your profile is pending verification
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Clerk's UserButton */}
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            userButtonPopoverCard: "py-2",
            userButtonPopoverActionButton: "block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100",
            userButtonPopoverFooter: "hidden"
          }
        }}
      >
        {/* Show "Become a Freelancer" option in UserButton dropdown if not a freelancer */}
        {!freelancerData && (
          <Link to="/freelancer/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Become a Freelancer
          </Link>
        )}
      </UserButton>
    </div>
  );
}; 