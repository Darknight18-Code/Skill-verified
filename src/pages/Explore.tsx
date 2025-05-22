import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CategoryNav } from '../components/explore/CategoryNav';
import { FadeIn } from '../components/animations/FadeIn';
import { Search, ArrowUpDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Star, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SearchFilters } from '../components/explore/SearchFilters';

interface Gig {
  _id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  packages?: Array<{
    price: number;
    deliveryTime: number;
  }>;
  freelancerId?: {
    title?: string;
    rating?: number;
    totalReviews?: number;
    profilePicture?: string;
  };
  video?: string;
}

export const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [hoveredGig, setHoveredGig] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sort') || 'newest');
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const category = searchParams.get('category') || 'all';

  // Sync state with URL params whenever searchParams changes
  useEffect(() => {
    setSortBy(searchParams.get('sort') || 'newest');
    setSearchQuery(searchParams.get('search') || '');
    // Add more filters here if needed
  }, [searchParams]);

  // Log when component mounts and when category changes
  useEffect(() => {
    console.log('Explore component mounted');
    console.log('Initial category:', category);
    console.log('Initial search query:', searchQuery);
    console.log('Initial sort by:', sortBy);
  }, []);

  useEffect(() => {
    console.log('Category changed to:', category);
    console.log('Search query:', searchQuery);
    console.log('Sort by:', sortBy);
  }, [category, searchQuery, sortBy]);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        console.log('Fetching gigs with params:', {
          category,
          searchQuery,
          sortBy
        });
        
        setLoading(true);
        const params: Record<string, string> = {};
        
        // Category filter
        if (category !== 'all') {
          params.category = category;
        }
        
        // Search query
        if (searchQuery) {
          params.search = searchQuery;
        }

        // Sort
        if (sortBy) {
          params.sort = sortBy;
        }

        // Additional filters from URL
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const minRating = searchParams.get('minRating');
        const deliveryTime = searchParams.get('deliveryTime');
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (minRating) params.minRating = minRating;
        if (deliveryTime) params.deliveryTime = deliveryTime;

        console.log('API request params:', params);
        const response = await axios.get('/api/gigs', { params });
        console.log('Gigs fetched successfully:', response.data.length);
        console.log('First gig:', response.data[0]);
        
        setGigs(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching gigs:', err);
        setError('Failed to load gigs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, [category, searchQuery, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search form submitted with query:', searchQuery);
    
    const newParams = new URLSearchParams(searchParams);
    if (searchQuery) {
      newParams.set('search', searchQuery);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (newSort: string) => {
    console.log('Sort changed to:', newSort);
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', newSort);
    setSearchParams(newParams);
    setSortBy(newSort);
  };

  const handleImageLoad = (gigId: string) => {
    setImageLoading(prev => ({ ...prev, [gigId]: false }));
  };

  const handleImageError = (gigId: string) => {
    setImageLoading(prev => ({ ...prev, [gigId]: false }));
    setImageError(prev => ({ ...prev, [gigId]: true }));
  };

  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  console.log('Rendering gigs grid with', gigs.length, 'gigs');
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-[400px] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Find the perfect service for your project
            </h1>
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for any service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(e);
                    }
                  }}
                  className="w-full px-6 py-4 text-lg rounded-full border-2 border-transparent focus:border-indigo-300 focus:ring-0 transition duration-200 shadow-lg"
                />
                <button 
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CategoryNav />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Section */}
          <div className="w-full lg:w-1/4">
            <SearchFilters />
          </div>

          {/* Gigs Grid Section */}
          <div className="w-full lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {category === 'all' ? 'All Services' : category}
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{gigs.length} gigs found</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="ml-4 pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Gigs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gigs.map((gig, index) => (
                <FadeIn key={gig._id} delay={index * 0.05}>
                  <Link to={`/gigs/${gig._id}`}>
                    <motion.div
                      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                      onMouseEnter={() => setHoveredGig(gig._id)}
                      onMouseLeave={() => setHoveredGig(null)}
                    >
                      {/* Gig Image with Heart Icon */}
                      <div className="relative h-48 overflow-hidden">
                        {gig.images && gig.images.length > 0 ? (
                          <>
                            {imageLoading[gig._id] !== false && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                              </div>
                            )}
                            <img 
                              src={gig.images[0]} 
                              alt={gig.title}
                              className={`w-full h-full object-cover transform transition-transform duration-300 ${
                                imageLoading[gig._id] !== false ? 'opacity-0' : 'opacity-100'
                              }`}
                              style={{
                                transform: hoveredGig === gig._id ? 'scale(1.05)' : 'scale(1)'
                              }}
                              onLoad={() => handleImageLoad(gig._id)}
                              onError={() => handleImageError(gig._id)}
                            />
                            {imageError[gig._id] && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                <span className="text-gray-400">Failed to load image</span>
                              </div>
                            )}
                          </>
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

                      {/* Gig Info */}
                      <div className="p-4">
                        {/* Freelancer Info */}
                        <div className="flex items-center space-x-2 mb-2">
                          {gig.freelancerId?.profilePicture ? (
                            <img 
                              src={gig.freelancerId.profilePicture} 
                              alt="Freelancer" 
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                          )}
                          <span className="text-sm font-medium">
                            {gig.freelancerId?.title || 'Unknown Freelancer'}
                          </span>
                          <div className="flex items-center ml-auto">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm font-medium">
                              {gig.freelancerId?.rating?.toFixed(1) || 'N/A'}
                            </span>
                            <span className="ml-1 text-xs text-gray-500">
                              ({gig.freelancerId?.totalReviews || 0})
                            </span>
                          </div>
                        </div>

                        {/* Gig Title */}
                        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 h-10 mb-2">
                          {gig.title}
                        </h3>

                        {/* Price and Video */}
                        <div className="flex items-center justify-between">
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
                    </motion.div>
                  </Link>
                </FadeIn>
              ))}
            </div>

            {/* No Results Message */}
            {gigs.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium text-gray-800 mb-2">No gigs found</h3>
                <p className="text-gray-600">
                  {category !== 'all' 
                    ? `No gigs found in the selected category.`
                    : searchQuery 
                      ? `No gigs match your search criteria. Try using different keywords.`
                      : `No gigs are available at the moment. Check back later!`
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};