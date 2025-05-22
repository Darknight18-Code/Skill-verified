import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FadeIn } from '../../components/animations/FadeIn';

interface Package {
  name: string;
  price: number;
  description: string;
}

interface PackageObject {
  basic?: Package;
  standard?: Package;
  premium?: Package;
}

interface Gig {
  _id: string;
  title: string;
  category: string;
  description: string;
  images: string[];
  packages: Package[] | PackageObject;
  status: 'active' | 'paused' | 'deleted';
  freelancerId: {
    _id: string;
    title: string;
    rating?: number;
    totalReviews?: number;
  };
}

export const MyGigs = () => {
  const { user } = useUser();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFreelancer, setIsFreelancer] = useState<boolean | null>(null);

  useEffect(() => {
    const checkFreelancerStatus = async () => {
      if (!user?.id || !user?.primaryEmailAddress?.emailAddress) return;

      try {
        const response = await axios.get(`/api/freelancers/${user.id}`);
        setIsFreelancer(true);
        return response.data;
      } catch (err: any) {
        if (err.response?.status === 404) {
          setIsFreelancer(false);
          setError('You need to register as a freelancer before you can create gigs.');
        }
        return null;
      }
    };

    const fetchGigs = async () => {
      if (!user?.id) return;

      try {
        const freelancer = await checkFreelancerStatus();
        if (!freelancer) {
          setLoading(false);
          return;
        }

        console.log('Fetching gigs for user:', {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress
        });
        
        const response = await axios.get(`/api/gigs/user/${user.id}`);
        console.log('Fetched gigs:', response.data);
        setGigs(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching gigs:', err);
        if (err.response?.status === 404) {
          setError('You need to register as a freelancer before you can create gigs.');
        } else {
          setError('Failed to fetch your gigs. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchGigs();
    }
  }, [user?.id, user?.primaryEmailAddress?.emailAddress]);

  const handleStatusChange = async (gigId: string, newStatus: 'active' | 'paused' | 'deleted') => {
    try {
      console.log('Updating gig status:', { gigId, newStatus });
      const response = await axios.patch(`/api/gigs/${gigId}/status`, { status: newStatus });
      console.log('Status update response:', response.data);
      setGigs(gigs.map(gig => 
        gig._id === gigId ? { ...gig, status: newStatus } : gig
      ));
    } catch (err: any) {
      console.error('Error updating gig status:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to update gig status. Please try again.');
    }
  };

  const getStartingPrice = (gig: Gig) => {
    if (Array.isArray(gig.packages)) {
      return gig.packages[0]?.price || 0;
    }
    const packages = gig.packages as PackageObject;
    return packages.basic?.price || packages.standard?.price || packages.premium?.price || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <FadeIn>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">My Gigs</h1>
            {isFreelancer && (
              <Link
                to="/freelancer/gigs/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Create New Gig
              </Link>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                  {!isFreelancer && (
                    <div className="mt-2">
                      <Link
                        to="/freelancer/register"
                        className="text-sm font-medium text-red-800 hover:text-red-700 underline"
                      >
                        Register as a Freelancer
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {isFreelancer && gigs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No gigs yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first gig</p>
              <div className="mt-6">
                <Link
                  to="/freelancer/gigs/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Create New Gig
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {gigs.map((gig) => (
                <div
                  key={gig._id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200"
                >
                  <div className="relative">
                    {gig.images && gig.images.length > 0 ? (
                      <img
                        src={gig.images[0]}
                        alt={gig.title}
                        className="w-full h-52 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-52 bg-gray-100 flex items-center justify-center rounded-t-lg">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <select
                        value={gig.status}
                        onChange={(e) => handleStatusChange(gig._id, e.target.value as 'active' | 'paused' | 'deleted')}
                        className="text-sm bg-white border border-gray-300 rounded-md shadow-sm px-2 py-1"
                      >
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="deleted">Delete</option>
                      </select>
                    </div>
                  </div>
                  <div className="p-4">
                    <Link to={`/gigs/${gig._id}`} className="block hover:text-indigo-600">
                      <h3 className="text-base font-medium text-gray-900 line-clamp-2 mb-2">{gig.title}</h3>
                    </Link>
                    <div className="flex items-center text-sm text-yellow-500 mb-3">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-medium">{gig.freelancerId?.rating?.toFixed(1) || '0.0'}</span>
                      <span className="text-gray-500 ml-1">({gig.freelancerId?.totalReviews || 0})</span>
                    </div>
                    <div className="border-t border-gray-100 pt-3 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {gig.status}
                        </span>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">STARTING AT</p>
                          <p className="text-base font-medium text-gray-900">
                            ${getStartingPrice(gig)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  );
}; 