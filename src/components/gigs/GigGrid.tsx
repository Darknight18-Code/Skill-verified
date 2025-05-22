import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart } from 'lucide-react';
import { FadeIn } from '../animations/FadeIn';
import { useGigs } from '../../hooks/useGigs';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Gig } from '../../types';
import { skillCategories } from '../../data/skillCategories';

export const GigGrid = () => {
  const { gigs, loading, error, fetchGigs } = useGigs();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const [hoveredGig, setHoveredGig] = useState<string | null>(null);
  const navigate = useNavigate();

  // This useEffect will fetch gigs whenever category or search changes
  useEffect(() => {
    console.log('Selected category changed to:', selectedCategory);
    console.log('Current search query:', searchQuery);
    
    // Build filters for the API call
    const filters: Record<string, string> = {};
    
    if (selectedCategory && selectedCategory !== 'all') {
      filters.category = selectedCategory;
      console.log('Using category ID for filter:', selectedCategory);
    }
    
    if (searchQuery) {
      filters.search = searchQuery;
    }
    
    console.log('Fetching gigs with filters:', filters);
    fetchGigs(filters);
  }, [selectedCategory, searchQuery, fetchGigs]);

  // Calculate category display name for the header
  const getCategoryDisplayName = () => {
    if (!selectedCategory || selectedCategory === 'all') {
      return 'All Services';
    }
    
    // Convert category ID to display name (e.g., "web-development" → "Web Development")
    return selectedCategory
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Filter gigs based on selected category and search query
  const filteredGigs = React.useMemo(() => {
    console.log('Using gigs directly from API, count:', gigs.length);
    console.log('Gig statuses:', gigs.map(gig => ({ id: gig._id, status: gig.status })));
    
    // No additional client-side filtering - use the API results directly
    return [...gigs];
  }, [gigs]);

  const handleGigClick = (gigId: string) => {
    navigate(`/gigs/${gigId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="ml-3 text-gray-600">Loading gigs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-2">Error loading gigs:</p>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  // Show appropriate message when no gigs are found
  if (filteredGigs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-800 mb-2">No gigs found</h3>
        <p className="text-gray-600">
          {selectedCategory !== 'all' 
            ? `No gigs found in the selected category.`
            : searchQuery 
              ? `No gigs match your search criteria. Try using different keywords.`
              : `No gigs are available at the moment. Check back later!`
          }
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {getCategoryDisplayName()}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {filteredGigs.length} {filteredGigs.length === 1 ? 'gig' : 'gigs'} found
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGigs.map((gig, index) => (
          <FadeIn key={gig._id} delay={index * 0.05}>
            <div
              onClick={() => handleGigClick(gig._id)}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
            >
              {/* Gig Image with Heart Icon */}
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                {gig.images && gig.images.length > 0 ? (
                  <img 
                    src={gig.images[0]} 
                    alt={gig.title}
                    className="w-full h-full object-cover transform transition-transform duration-300"
                    style={{
                      transform: hoveredGig === gig._id ? 'scale(1.05)' : 'scale(1)'
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-200">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
                <button 
                  className="absolute top-3 right-3 p-1.5 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 focus:outline-none"
                  onClick={(e) => {
                    e.preventDefault();
                    // Add to favorites logic here
                  }}
                >
                  <Heart className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Freelancer Info */}
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  {gig.freelancerId && typeof gig.freelancerId === 'object' && gig.freelancerId.profilePicture ? (
                    <img 
                      src={gig.freelancerId.profilePicture} 
                      alt="Freelancer" 
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                  )}
                  <span className="text-sm font-medium">
                    {gig.freelancerId && typeof gig.freelancerId === 'object' ? gig.freelancerId.title : 'Freelancer'}
                  </span>
                  <div className="flex items-center ml-auto">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium">
                      {gig.freelancerId && typeof gig.freelancerId === 'object' ? gig.freelancerId.rating?.toFixed(1) || '5.0' : '5.0'}
                    </span>
                    <span className="ml-1 text-xs text-gray-500">
                      ({gig.freelancerId && typeof gig.freelancerId === 'object' ? gig.freelancerId.totalReviews || '0' : '0'})
                    </span>
                  </div>
                </div>

                {/* Gig Title */}
                <h3 className="text-sm font-medium text-gray-800 line-clamp-2 h-10 mb-2">
                  {gig.title}
                </h3>

                {/* Price */}
                <div className="mt-2 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">From</p>
                    <p className="text-lg font-bold text-gray-900">
                      ${gig.packages?.[0]?.price || 'Contact'}
                    </p>
                  </div>
                  {gig.video && (
                    <div className="bg-gray-100 rounded-full p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
      
      {filteredGigs.length > 4 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Gigs you may like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGigs.slice(0, 4).map((gig, index) => (
              <FadeIn key={`recommended-${gig._id}`} delay={index * 0.05}>
                <div
                  onClick={() => handleGigClick(`recommended-${gig._id}`)}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
                >
                  {/* Gig Image with Heart Icon */}
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {gig.images && gig.images.length > 0 ? (
                      <img 
                        src={gig.images[0]} 
                        alt={gig.title}
                        className="w-full h-full object-cover transform transition-transform duration-300"
                        style={{
                          transform: hoveredGig === `recommended-${gig._id}` ? 'scale(1.05)' : 'scale(1)'
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-200">
                        <span className="text-gray-400">No image available</span>
                      </div>
                    )}
                    <button 
                      className="absolute top-3 right-3 p-1.5 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 focus:outline-none"
                      onClick={(e) => {
                        e.preventDefault();
                        // Add to favorites logic here
                      }}
                    >
                      <Heart className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Freelancer Info */}
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      {gig.freelancerId && typeof gig.freelancerId === 'object' && gig.freelancerId.profilePicture ? (
                        <img 
                          src={gig.freelancerId.profilePicture} 
                          alt="Freelancer" 
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                      )}
                      <span className="text-sm font-medium">
                        {gig.freelancerId && typeof gig.freelancerId === 'object' ? gig.freelancerId.title : 'Freelancer'}
                      </span>
                      <div className="flex items-center ml-auto">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium">
                          {gig.freelancerId && typeof gig.freelancerId === 'object' ? gig.freelancerId.rating?.toFixed(1) || '4.9' : '4.9'}
                        </span>
                        <span className="ml-1 text-xs text-gray-500">
                          ({gig.freelancerId && typeof gig.freelancerId === 'object' ? gig.freelancerId.totalReviews || '0' : '0'})
                        </span>
                      </div>
                    </div>

                    {/* Gig Title */}
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 h-10 mb-2">
                      {gig.title}
                    </h3>

                    {/* Price */}
                    <div className="mt-2 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">From</p>
                        <p className="text-lg font-bold text-gray-900">
                          ${gig.packages?.[0]?.price || 'Contact'}
                        </p>
                      </div>
                      {gig.video && (
                        <div className="bg-gray-100 rounded-full p-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 