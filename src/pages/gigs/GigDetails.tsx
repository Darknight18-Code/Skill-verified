import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { FadeIn } from '../../components/animations/FadeIn';
import { Star, Clock, RefreshCw, Check, Info, X, MapPin, Globe, Award } from 'lucide-react';

interface GigPackage {
  name: string;
  description: string;
  deliveryTime: number;
  revisions: number;
  price: number;
  features: string[];
}

interface Freelancer {
  _id: string;
  title: string;
  rating: number;
  totalReviews: number;
  profilePicture: string;
  location: string;
  memberSince: string;
  lastDelivery: string;
  languages: string[];
  skills: string[];
  description: string;
  responseTime: string;
  completedProjects: number;
  orderQueue: number;
}

interface Gig {
  _id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  video?: string;
  packages: GigPackage[];
  freelancerId: Freelancer;
}

export const GigDetails = () => {
  const { gigId } = useParams();
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const [gig, setGig] = useState<Gig | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'standard' | 'premium'>('basic');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);

  // Commission rates (matching Fiverr's structure)
  const SERVICE_FEE_PERCENTAGE = 5.5;
  const PAYMENT_PROCESSING_FEE = 2;
  const VAT_PERCENTAGE = 20;

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const response = await axios.get(`/api/gigs/${gigId}`);
        setGig(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load gig details');
      } finally {
        setLoading(false);
      }
    };

    if (gigId) {
      fetchGig();
    }
  }, [gigId]);

  const handlePackageSelect = (packageType: 'basic' | 'standard' | 'premium') => {
    setSelectedPackage(packageType);
  };

  const getSelectedPackageIndex = () => {
    switch (selectedPackage) {
      case 'standard':
        return 1;
      case 'premium':
        return 2;
      default:
        return 0;
    }
  };

  const calculatePriceBreakdown = (basePrice: number) => {
    const serviceFee = (basePrice * SERVICE_FEE_PERCENTAGE) / 100;
    const processingFee = PAYMENT_PROCESSING_FEE;
    const vatAmount = ((basePrice + serviceFee + processingFee) * VAT_PERCENTAGE) / 100;
    const totalPrice = basePrice + serviceFee + processingFee + vatAmount;

    return {
      basePrice,
      serviceFee,
      processingFee,
      vatAmount,
      totalPrice
    };
  };

  const handleOrderNow = async () => {
    if (!isLoaded) {
      return; // Wait for auth to load
    }

    if (!user) {
      // Save current URL to redirect back after login
      const returnUrl = encodeURIComponent(window.location.pathname);
      navigate(`/sign-in?redirect=${returnUrl}`);
      return;
    }

    try {
      const selectedPkg = gig?.packages[getSelectedPackageIndex()];
      if (!selectedPkg) throw new Error('Package not found');

      // Show loading state
      setLoading(true);

      const response = await axios.post('/api/payments/create-checkout', {
        gigId,
        packageType: selectedPackage,
        buyerId: user.id,
        amount: priceBreakdown.totalPrice,
        metadata: {
          gigTitle: gig.title,
          packageName: selectedPkg.name,
          deliveryTime: selectedPkg.deliveryTime,
          revisions: selectedPkg.revisions,
          sellerId: gig.freelancerId._id
        }
      });

      // Redirect to checkout page
      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error || 'Gig not found'}</div>
      </div>
    );
  }

  const selectedPkg = gig.packages[getSelectedPackageIndex()];
  const priceBreakdown = calculatePriceBreakdown(selectedPkg.price);

  return (
    <FadeIn>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Gig Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Image Gallery */}
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={gig.images[0]}
                    alt={gig.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Gig Info */}
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    {gig.title}
                  </h1>

                  {/* Freelancer Info Preview */}
                  <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={gig.freelancerId.profilePicture || '/default-avatar.png'}
                      alt="Freelancer"
                      className="w-16 h-16 rounded-full border-2 border-white shadow-md"
                    />
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900 text-lg">
                        {gig.freelancerId.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="font-medium">{gig.freelancerId.rating.toFixed(1)}</span>
                        <span className="mx-1">·</span>
                        <span>{gig.freelancerId.totalReviews} reviews</span>
                        <span className="mx-2">|</span>
                        <span>{gig.freelancerId.orderQueue} Orders in Queue</span>
                      </div>
                      <div className="flex items-center mt-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{gig.freelancerId.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="prose max-w-none">
                    <h2 className="text-xl font-semibold mb-4">About This Gig</h2>
                    <p className="text-gray-600">{gig.description}</p>
                  </div>
                </div>

                {/* Freelancer Detailed Profile */}
                <div className="p-6 border-t border-gray-200">
                  <h2 className="text-xl font-semibold mb-6">About The Seller</h2>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Member since</div>
                      <div className="font-medium mt-1">{gig.freelancerId.memberSince}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Avg. response time</div>
                      <div className="font-medium mt-1">{gig.freelancerId.responseTime}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Last delivery</div>
                      <div className="font-medium mt-1">{gig.freelancerId.lastDelivery}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Projects completed</div>
                      <div className="font-medium mt-1">{gig.freelancerId.completedProjects}</div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <p className="text-gray-600">{gig.freelancerId.description}</p>
                  </div>

                  {/* Languages & Skills */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Globe className="w-4 h-4 mr-2" />
                        Languages
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {gig.freelancerId.languages.map((language, index) => (
                          <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Award className="w-4 h-4 mr-2" />
                        Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {gig.freelancerId.skills.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Package Comparison Table */}
                <div className="p-6 border-t border-gray-200">
                  <h2 className="text-xl font-semibold mb-6">Compare Packages</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="py-4 px-6 text-left">Package</th>
                          {gig.packages.map((pkg, index) => (
                            <th key={index} className="py-4 px-6 text-center">
                              <div className="font-medium">{pkg.name}</div>
                              <div className="text-2xl font-bold mt-2">${pkg.price}</div>
                              <div className="text-sm text-gray-500 mt-1">{pkg.description}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-4 px-6 font-medium">Delivery Time</td>
                          {gig.packages.map((pkg, index) => (
                            <td key={index} className="py-4 px-6 text-center">
                              {pkg.deliveryTime} days
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-4 px-6 font-medium">Revisions</td>
                          {gig.packages.map((pkg, index) => (
                            <td key={index} className="py-4 px-6 text-center">
                              {pkg.revisions}
                            </td>
                          ))}
                        </tr>
                        {/* Features comparison */}
                        {Array.from(new Set(gig.packages.flatMap(pkg => pkg.features))).map((feature, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-4 px-6 font-medium">{feature}</td>
                            {gig.packages.map((pkg, pkgIndex) => (
                              <td key={pkgIndex} className="py-4 px-6 text-center">
                                {pkg.features.includes(feature) ? (
                                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                                ) : (
                                  <X className="w-5 h-5 text-red-500 mx-auto" />
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Package Selection */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex space-x-4 mb-6">
                      {['basic', 'standard', 'premium'].map((pkg, index) => (
                        gig.packages[index] && (
                          <button
                            key={pkg}
                            onClick={() => handlePackageSelect(pkg as any)}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                              selectedPackage === pkg
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {pkg.charAt(0).toUpperCase() + pkg.slice(1)}
                          </button>
                        )
                      ))}
                    </div>

                    {/* Selected Package Details */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900">
                          ${selectedPkg.price}
                        </span>
                        <div className="flex items-center text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{selectedPkg.deliveryTime} days delivery</span>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-500">
                        <RefreshCw className="w-4 h-4 mr-1" />
                        <span>{selectedPkg.revisions} revisions</span>
                      </div>

                      {/* Package Description */}
                      <p className="text-gray-600 text-sm">{selectedPkg.description}</p>

                      {/* Features */}
                      <div className="space-y-2">
                        {selectedPkg.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-gray-600">
                            <Check className="w-4 h-4 text-green-500 mr-2" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Price Breakdown Button */}
                      <button
                        onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                        className="w-full flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
                      >
                        <span>Price Breakdown</span>
                        <Info className="w-4 h-4" />
                      </button>

                      {/* Price Breakdown Details */}
                      {showPriceBreakdown && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subtotal</span>
                              <span className="font-medium">${priceBreakdown.basePrice}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Service fee ({SERVICE_FEE_PERCENTAGE}%)</span>
                              <span className="font-medium">${priceBreakdown.serviceFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Processing fee</span>
                              <span className="font-medium">${priceBreakdown.processingFee}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">VAT ({VAT_PERCENTAGE}%)</span>
                              <span className="font-medium">${priceBreakdown.vatAmount.toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between font-semibold">
                                <span>Total</span>
                                <span>${priceBreakdown.totalPrice.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleOrderNow}
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
                          loading 
                            ? 'bg-indigo-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        } text-white`}
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                            Processing...
                          </div>
                        ) : (
                          `Continue (${priceBreakdown.totalPrice.toFixed(2)})`
                        )}
                      </button>

                      {/* Show error message if any */}
                      {error && (
                        <div className="mt-2 text-sm text-red-600">
                          {error}
                        </div>
                      )}

                      {/* Contact Seller */}
                      <button
                        className="w-full py-3 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      >
                        Contact Seller
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}; 