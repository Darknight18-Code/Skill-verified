import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FadeIn } from '../../components/animations/FadeIn';
import { useUser, useAuth } from '@clerk/clerk-react';
import { 
  Briefcase, 
  GraduationCap, 
  Globe, 
  DollarSign, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5173/api';

interface FreelancerProfile {
  title: string;
  description: string;
  hourlyRate: number;
  skills: string[];
  experience: {
    years: number;
    description: string;
  };
  education: {
    degree: string;
    institution: string;
    year: number;
  }[];
  languages: string[];
  location: string;
  phone: string;
  portfolio: {
    title: string;
    description: string;
    link: string;
  }[];
}

export const RegisterFreelancer = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [error, setError] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<FreelancerProfile>({
    title: '',
    description: '',
    hourlyRate: 0,
    skills: [],
    experience: {
      years: 0,
      description: ''
    },
    education: [],
    languages: [],
    location: '',
    phone: '',
    portfolio: []
  });

  const steps = [
    { number: 1, title: 'Basic Info', icon: Briefcase },
    { number: 2, title: 'Skills & Experience', icon: GraduationCap },
    { number: 3, title: 'Portfolio & Pricing', icon: Globe },
    { number: 4, title: 'Contact Details', icon: Phone }
  ];

  const handleSubmit = async () => {
    try {
      if (!user) return;
      const token = await getToken();
      setError(null);

      console.log('Making request to:', `${axios.defaults.baseURL}/users/${user.id}`);

      // First, verify the user exists and has certifications
      const userResponse = await axios.get(`/users/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('User response:', userResponse.data);

      if (!userResponse.data.certifications || userResponse.data.certifications.length === 0) {
        setError('Please complete at least one skill assessment before registering as a freelancer');
        return;
      }

      // Log certifications for debugging
      console.log('User certifications:', userResponse.data.certifications);

      const response = await axios.post('/api/freelancers/register', {
        userId: user.id,
        ...profile
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      navigate('/freelancer/dashboard');
    } catch (error: any) {
      console.error('Error registering freelancer:', error);
      if (error.response?.status === 404) {
        setError('User not found. Please try logging in again.');
      } else if (error.response?.status === 400) {
        setError(error.response.data.error || 'Failed to register as freelancer');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Professional Title</label>
              <input
                type="text"
                value={profile.title}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., Senior Web Developer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={profile.description}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Tell clients about yourself and your expertise..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., New York, USA"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Skills</label>
              <input
                type="text"
                value={profile.skills.join(', ')}
                onChange={(e) => setProfile({ ...profile, skills: e.target.value.split(',').map(s => s.trim()) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., JavaScript, React, Node.js"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
              <input
                type="number"
                value={profile.experience.years}
                onChange={(e) => setProfile({ 
                  ...profile, 
                  experience: { ...profile.experience, years: parseInt(e.target.value) }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., 5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Experience Description</label>
              <textarea
                value={profile.experience.description}
                onChange={(e) => setProfile({ 
                  ...profile, 
                  experience: { ...profile.experience, description: e.target.value }
                })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Describe your experience and achievements..."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hourly Rate ($)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  value={profile.hourlyRate}
                  onChange={(e) => setProfile({ ...profile, hourlyRate: parseInt(e.target.value) })}
                  className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="e.g., 50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Portfolio Projects</label>
              <div className="space-y-4">
                {profile.portfolio.map((project, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <input
                      type="text"
                      value={project.title}
                      onChange={(e) => {
                        const newPortfolio = [...profile.portfolio];
                        newPortfolio[index] = { ...project, title: e.target.value };
                        setProfile({ ...profile, portfolio: newPortfolio });
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Project Title"
                    />
                    <textarea
                      value={project.description}
                      onChange={(e) => {
                        const newPortfolio = [...profile.portfolio];
                        newPortfolio[index] = { ...project, description: e.target.value };
                        setProfile({ ...profile, portfolio: newPortfolio });
                      }}
                      rows={2}
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Project Description"
                    />
                    <input
                      type="url"
                      value={project.link}
                      onChange={(e) => {
                        const newPortfolio = [...profile.portfolio];
                        newPortfolio[index] = { ...project, link: e.target.value };
                        setProfile({ ...profile, portfolio: newPortfolio });
                      }}
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Project Link"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setProfile({
                    ...profile,
                    portfolio: [...profile.portfolio, { title: '', description: '', link: '' }]
                  })}
                  className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  Add Project
                </button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Languages</label>
              <input
                type="text"
                value={profile.languages.join(', ')}
                onChange={(e) => setProfile({ ...profile, languages: e.target.value.split(',').map(s => s.trim()) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., English, Spanish"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <FadeIn>
          <div className="bg-white rounded-lg shadow-lg p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                    {error.includes('skill assessment') && (
                      <div className="mt-2">
                        <a
                          href="/skills"
                          className="text-sm font-medium text-red-800 hover:text-red-900"
                        >
                          Take a skill assessment now →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex justify-between">
                {steps.map((step) => (
                  <div key={step.number} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      currentStep >= step.number ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {currentStep > step.number ? <CheckCircle className="w-5 h-5" /> : step.number}
                    </div>
                    {step.number < steps.length && (
                      <div className={`w-24 h-1 mx-2 ${
                        currentStep > step.number ? 'bg-indigo-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {steps.map((step) => (
                  <div key={step.number} className="text-sm font-medium text-gray-600">
                    {step.title}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <div className="mb-8">
              {renderStep()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                  currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </button>
              <button
                onClick={() => {
                  if (currentStep === steps.length) {
                    handleSubmit();
                  } else {
                    setCurrentStep(prev => Math.min(steps.length, prev + 1));
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {currentStep === steps.length ? 'Complete Registration' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}; 