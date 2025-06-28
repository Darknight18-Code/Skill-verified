import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useGigs } from '../../hooks/useGigs';
import { FadeIn } from '../../components/animations/FadeIn';
import { skillCategories } from '../../data/skillCategories';
import { motion } from 'framer-motion';
import { Upload, Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { Toast } from '../../components/ui/Toast';

interface Package {
  name: string;
  description: string;
  deliveryTime: number;
  revisions: number;
  numConcepts: number;
  price: number;
  features: {
    logoTransparency: boolean;
    vectorFile: boolean;
    printableFile: boolean;
    threeDMockup: boolean;
    sourceFile: boolean;
    stationeryDesigns: boolean;
    socialMediaKit: boolean;
  };
}

interface ValidationError {
  field: string;
  message: string;
}

interface GigFormData {
  // Overview
  title: string;
  category: string;
  searchTags: string[];
  
  // Pricing
  packages: {
    basic: Package;
    standard: Package;
    premium: Package;
  };
  extraFastDelivery: {
    basic: { enabled: boolean; price: number; time: number };
    standard: { enabled: boolean; price: number; time: number };
    premium: { enabled: boolean; price: number; time: number };
  };
  
  // Description
  description: string;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  
  // Requirements
  requirements: Array<{
    question: string;
    type: 'text' | 'multiple_choice';
    choices?: string[];
    required: boolean;
  }>;
  
  // Gallery
  images: File[];
  video: File | null;
  documents: File[];
  
  // Additional fields
  deliveryTime: number;
  requiredSkills: string[];
}

type PackageTier = 'basic' | 'standard' | 'premium';

interface UserCertification {
  skillId: string;
  name: string;
  category: string;
  issuedAt: Date;
  score: number;
}

interface Step {
  id: number;
  title: string;
  description: string;
  icon: JSX.Element;
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Overview',
    description: 'Set up your gig title and category',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Pricing',
    description: 'Define your packages and pricing',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Description',
    description: 'Describe your service and add FAQs',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Requirements',
    description: 'Add questions for your buyers',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 5,
    title: 'Gallery',
    description: 'Showcase your work',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 6,
    title: 'Publish',
    description: 'Review and publish your gig',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const COMMISSION_RATE = 0.10; // 10% commission

export const CreateGig = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [userCertifications, setUserCertifications] = useState<UserCertification[]>([]);
  const [loadingCertifications, setLoadingCertifications] = useState(true);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [formData, setFormData] = useState<GigFormData>({
    title: '',
    category: '',
    searchTags: [],
    packages: {
      basic: {
        name: '',
        description: '',
        deliveryTime: 2,
        revisions: 1,
        numConcepts: 1,
        price: 5,
        features: {
          logoTransparency: false,
          vectorFile: false,
          printableFile: false,
          threeDMockup: false,
          sourceFile: false,
          stationeryDesigns: false,
          socialMediaKit: false
        }
      },
      standard: {
        name: '',
        description: '',
        deliveryTime: 4,
        revisions: 2,
        numConcepts: 2,
        price: 10,
        features: {
          logoTransparency: false,
          vectorFile: false,
          printableFile: false,
          threeDMockup: false,
          sourceFile: false,
          stationeryDesigns: false,
          socialMediaKit: false
        }
      },
      premium: {
        name: '',
        description: '',
        deliveryTime: 7,
        revisions: 3,
        numConcepts: 3,
        price: 20,
        features: {
          logoTransparency: false,
          vectorFile: false,
          printableFile: false,
          threeDMockup: false,
          sourceFile: false,
          stationeryDesigns: false,
          socialMediaKit: false
        }
      }
    },
    extraFastDelivery: {
      basic: { enabled: false, price: 0, time: 1 },
      standard: { enabled: false, price: 0, time: 1 },
      premium: { enabled: false, price: 0, time: 1 }
    },
    description: '',
    faqs: [],
    requirements: [],
    images: [],
    video: null,
    documents: [],
    deliveryTime: 2,
    requiredSkills: []
  });
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const packageTiers = ['basic', 'standard', 'premium'] as const;

  const featureKeys = [
    'logoTransparency',
    'vectorFile',
    'printableFile',
    'threeDMockup',
    'sourceFile',
    'stationeryDesigns',
    'socialMediaKit'
  ] as const;

  useEffect(() => {
    const fetchUserCertifications = async () => {
      if (!user) return;

      try {
        const response = await axios.get(`/api/users/${user.id}`);
        setUserCertifications(response.data.certifications || []);
      } catch (err: any) {
        console.error('Error fetching user certifications:', err);
        setError('Failed to load your certifications');
      } finally {
        setLoadingCertifications(false);
      }
    };

    fetchUserCertifications();
  }, [user]);

  // Filter categories based on user's certifications
  const availableCategories = skillCategories.filter(category => {
    // Check if user has a certification in this category with a score >= 70
    const hasCertification = userCertifications.some(
      cert => cert.category === category.name && cert.score >= 70
    );
    
    if (hasCertification) {
      console.log(`User is certified in category: ${category.name} (${category.id})`);
    }
    
    return hasCertification;
  });
  
  // Log all available categories for debugging
  console.log('Available categories for user:', availableCategories.map(c => ({ id: c.id, name: c.name })));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(',').map(skill => skill.trim());
    setFormData(prev => ({
      ...prev,
      requiredSkills: skills
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handlePackageChange = (tier: 'basic' | 'standard' | 'premium', field: keyof Package, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      packages: {
        ...prev.packages,
        [tier]: {
          ...prev.packages[tier],
          [field]: value
        }
      }
    }));
  };

  const handleExtraDeliveryChange = (tier: 'basic' | 'standard' | 'premium', field: 'enabled' | 'time' | 'price', value: boolean | number) => {
    setFormData(prev => ({
      ...prev,
      extraFastDelivery: {
        ...prev.extraFastDelivery,
        [tier]: {
          ...prev.extraFastDelivery[tier],
          [field]: value
        }
      }
    }));
  };

  const handlePackageFeatureChange = (tier: 'basic' | 'standard' | 'premium', feature: keyof Package['features'], checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      packages: {
        ...prev.packages,
        [tier]: {
          ...prev.packages[tier],
          features: {
            ...prev.packages[tier].features,
            [feature]: checked
          }
        }
      }
    }));
  };

  const validateStep = (step: number): boolean => {
    const errors: ValidationError[] = [];

    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          errors.push({ field: 'title', message: 'Gig title is required' });
        }
        if (!formData.category) {
          errors.push({ field: 'category', message: 'Category is required' });
        }
        if (formData.searchTags.length === 0) {
          errors.push({ field: 'searchTags', message: 'At least one search tag is required' });
        }
        break;

      case 2:
        // Validate Basic Package
        if (!formData.packages.basic.name.trim()) {
          errors.push({ field: 'packages.basic.name', message: 'Basic package name is required' });
        }
        if (!formData.packages.basic.description.trim()) {
          errors.push({ field: 'packages.basic.description', message: 'Basic package description is required' });
        }
        if (formData.packages.basic.price < 5) {
          errors.push({ field: 'packages.basic.price', message: 'Price must be at least $5' });
        }

        // Validate Standard Package
        if (!formData.packages.standard.name.trim()) {
          errors.push({ field: 'packages.standard.name', message: 'Standard package name is required' });
        }
        if (!formData.packages.standard.description.trim()) {
          errors.push({ field: 'packages.standard.description', message: 'Standard package description is required' });
        }
        if (formData.packages.standard.price < 5) {
          errors.push({ field: 'packages.standard.price', message: 'Price must be at least $5' });
        }
        if (formData.packages.standard.price <= formData.packages.basic.price) {
          errors.push({ field: 'packages.standard.price', message: 'Standard package price must be higher than basic package' });
        }

        // Validate Premium Package
        if (!formData.packages.premium.name.trim()) {
          errors.push({ field: 'packages.premium.name', message: 'Premium package name is required' });
        }
        if (!formData.packages.premium.description.trim()) {
          errors.push({ field: 'packages.premium.description', message: 'Premium package description is required' });
        }
        if (formData.packages.premium.price < 5) {
          errors.push({ field: 'packages.premium.price', message: 'Price must be at least $5' });
        }
        if (formData.packages.premium.price <= formData.packages.standard.price) {
          errors.push({ field: 'packages.premium.price', message: 'Premium package price must be higher than standard package' });
        }

        // Validate delivery times
        if (formData.packages.basic.deliveryTime < 1) {
          errors.push({ field: 'packages.basic.deliveryTime', message: 'Delivery time must be at least 1 day' });
        }
        if (formData.packages.standard.deliveryTime < 1) {
          errors.push({ field: 'packages.standard.deliveryTime', message: 'Delivery time must be at least 1 day' });
        }
        if (formData.packages.premium.deliveryTime < 1) {
          errors.push({ field: 'packages.premium.deliveryTime', message: 'Delivery time must be at least 1 day' });
        }
        break;

      case 3:
        if (!formData.description.trim()) {
          errors.push({ field: 'description', message: 'Gig description is required' });
        }
        if (formData.faqs.length > 0) {
          formData.faqs.forEach((faq, index) => {
            if (!faq.question.trim()) {
              errors.push({ field: `faqs.${index}.question`, message: 'FAQ question is required' });
            }
            if (!faq.answer.trim()) {
              errors.push({ field: `faqs.${index}.answer`, message: 'FAQ answer is required' });
            }
          });
        }
        break;

      case 4:
        if (formData.requirements.length > 0) {
          formData.requirements.forEach((req, index) => {
            if (!req.question.trim()) {
              errors.push({ field: `requirements.${index}.question`, message: 'Question is required' });
            }
            if (req.type === 'multiple_choice' && (!req.choices || req.choices.length === 0)) {
              errors.push({ field: `requirements.${index}.choices`, message: 'Choices are required for multiple choice questions' });
            }
          });
        }
        break;

      case 5:
        if (formData.images.length === 0) {
          errors.push({ field: 'images', message: 'At least one image is required' });
        }
        if (formData.requiredSkills.length === 0) {
          errors.push({ field: 'requiredSkills', message: 'At least one required skill is needed' });
        }
        if (formData.deliveryTime < 1) {
          errors.push({ field: 'deliveryTime', message: 'Delivery time must be at least 1 day' });
        }
        break;
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setCompletedSteps(completedSteps.filter(step => step !== currentStep));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Get the primary email address from Clerk user
      const emailAddress = user.primaryEmailAddress?.emailAddress;
      if (!emailAddress) {
        setToast({
          message: 'No email address found. Please ensure you have a primary email address set up.',
          type: 'error'
        });
        return;
      }

      // Process the package prices to numeric values
      Object.entries(formData.packages).forEach(([tier, pkg]) => {
        pkg.price = parseFloat(pkg.price.toString());
        pkg.deliveryTime = parseInt(pkg.deliveryTime.toString());
        pkg.revisions = parseInt(pkg.revisions.toString());
      });

      // Debug log to check what's being sent to the server
      console.log('Submitting gig with data:', {
        ...formData,
        category: formData.category // Focus on category value
      });
      
      // Find the selected category from skillCategories for better logging
      const selectedCategory = skillCategories.find(cat => cat.id === formData.category);
      console.log('Selected category details:', {
        id: formData.category,
        name: selectedCategory?.name || 'Unknown',
        exists: !!selectedCategory
      });

      // Create FormData object to handle file uploads
      const formDataToSend = new FormData();
      
      // Add basic form data
      formDataToSend.append('freelancerId', user.id);
      formDataToSend.append('userEmail', emailAddress);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('deliveryTime', formData.deliveryTime.toString());
      formDataToSend.append('packages', JSON.stringify(formData.packages));
      formDataToSend.append('extraFastDelivery', JSON.stringify(formData.extraFastDelivery));
      formDataToSend.append('faqs', JSON.stringify(formData.faqs));
      formDataToSend.append('requirements', JSON.stringify(formData.requirements));
      formDataToSend.append('searchTags', JSON.stringify(formData.searchTags));
      formDataToSend.append('requiredSkills', JSON.stringify(formData.requiredSkills));

      // Add images if they exist
      formData.images.forEach((image, index) => {
        if (image) {
          formDataToSend.append(`images`, image);
        }
      });

      // Add video if it exists
      if (formData.video) {
        formDataToSend.append('video', formData.video);
      }

      // Add documents if they exist
      formData.documents.forEach((doc, index) => {
        if (doc) {
          formDataToSend.append(`documents`, doc);
        }
      });

      const response = await axios.post('/api/gigs/create', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Gig created successfully:', response.data);
      setToast({
        message: 'Gig created successfully!',
        type: 'success'
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/freelancer/gigs');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating gig:', err);
      setToast({
        message: err.response?.data?.error || 'Failed to create gig. Please try again.',
        type: 'error'
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Gig Title
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="I will..."
                  maxLength={80}
                />
                <p className="mt-1 text-sm text-gray-500 flex justify-end">
                  {formData.title.length} / 80 max
                </p>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                As your Gig storefront, your title is the most important place to include keywords that buyers would likely use to search for a service like yours.
              </p>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              {loadingCertifications ? (
                <div className="mt-1 flex items-center justify-center h-10">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                </div>
              ) : availableCategories.length === 0 ? (
                <div className="mt-1 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    You need to pass at least one skill assessment test before creating a gig.
                    <a href="/skills" className="ml-1 text-indigo-600 hover:text-indigo-800 underline">
                      Take a skill test
                    </a>
                  </p>
                </div>
              ) : (
                <div className="mt-1 grid grid-cols-2 gap-4">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">SELECT A CATEGORY</option>
                    {availableCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Search Tags
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  placeholder="Enter search terms"
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.searchTags.join(', ')}
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map(tag => tag.trim());
                    setFormData(prev => ({
                      ...prev,
                      searchTags: tags.filter(tag => tag !== '').slice(0, 5)
                    }));
                  }}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Tag your Gig with buzz words that are relevant to the services you offer. Use all 5 tags to get found.
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  5 tags maximum. Use letters and numbers only.
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Packages</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Set up your package tiers and pricing
                </p>
              </div>

              <div className="border-t border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Features
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        BASIC
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STANDARD
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PREMIUM
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Package Name */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Package Name <span className="text-red-500">*</span>
                      </td>
                      {packageTiers.map((tier) => (
                        <td key={tier} className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={formData.packages[tier].name}
                            onChange={(e) => handlePackageChange(tier, 'name', e.target.value)}
                            className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                              validationErrors.some(e => e.field === `packages.${tier}.name`) ? 'border-red-500' : ''
                            }`}
                            placeholder="Name your package"
                          />
                          {validationErrors.some(e => e.field === `packages.${tier}.name`) && (
                            <p className="mt-1 text-sm text-red-600">
                              {validationErrors.find(e => e.field === `packages.${tier}.name`)?.message}
                            </p>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Description */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Description <span className="text-red-500">*</span>
                      </td>
                      {packageTiers.map((tier) => (
                        <td key={tier} className="px-6 py-4 whitespace-nowrap">
                          <textarea
                            value={formData.packages[tier].description}
                            onChange={(e) => handlePackageChange(tier, 'description', e.target.value)}
                            className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                              validationErrors.some(e => e.field === `packages.${tier}.description`) ? 'border-red-500' : ''
                            }`}
                            placeholder="Describe the details of your offering"
                            rows={3}
                          />
                          {validationErrors.some(e => e.field === `packages.${tier}.description`) && (
                            <p className="mt-1 text-sm text-red-600">
                              {validationErrors.find(e => e.field === `packages.${tier}.description`)?.message}
                            </p>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Delivery Time */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Delivery Time
                      </td>
                      {packageTiers.map((tier) => (
                        <td key={tier} className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={formData.packages[tier].deliveryTime}
                            onChange={(e) => handlePackageChange(tier, 'deliveryTime', parseInt(e.target.value))}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 14, 21, 30].map((days) => (
                              <option key={days} value={days}>{days} Day{days > 1 ? 's' : ''}</option>
                            ))}
                          </select>
                        </td>
                      ))}
                    </tr>

                    {/* Revisions */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Revisions
                      </td>
                      {packageTiers.map((tier) => (
                        <td key={tier} className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={formData.packages[tier].revisions}
                            onChange={(e) => handlePackageChange(tier, 'revisions', parseInt(e.target.value))}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'unlimited'].map((num) => (
                              <option key={num} value={num}>{num === 'unlimited' ? 'Unlimited' : num}</option>
                            ))}
                          </select>
                        </td>
                      ))}
                    </tr>

                    {/* Features */}
                    {featureKeys.map((key) => (
                      <tr key={key}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {key}
                        </td>
                        {packageTiers.map((tier) => (
                          <td key={tier} className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={formData.packages[tier].features[key]}
                              onChange={(e) => handlePackageFeatureChange(tier, key, e.target.checked)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}

                    {/* Price */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Price <span className="text-red-500">*</span>
                      </td>
                      {packageTiers.map((tier) => (
                        <td key={tier} className="px-6 py-4 whitespace-nowrap">
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                              type="number"
                              value={formData.packages[tier].price}
                              onChange={(e) => handlePackageChange(tier, 'price', parseInt(e.target.value))}
                              min="5"
                              className={`block w-full pl-7 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                                validationErrors.some(e => e.field === `packages.${tier}.price`) ? 'border-red-500' : ''
                              }`}
                            />
                          </div>
                          {validationErrors.some(e => e.field === `packages.${tier}.price`) && (
                            <p className="mt-1 text-sm text-red-600">
                              {validationErrors.find(e => e.field === `packages.${tier}.price`)?.message}
                            </p>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Extra Fast Delivery */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Extra Fast Delivery</h3>
              {packageTiers.map((tier) => (
                <div key={tier} className="mb-4 last:mb-0">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.extraFastDelivery[tier].enabled}
                      onChange={(e) => handleExtraDeliveryChange(tier, 'enabled', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700 capitalize">
                      {tier}
                    </label>
                  </div>
                  {formData.extraFastDelivery[tier].enabled && (
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Delivery Time
                        </label>
                        <select
                          value={formData.extraFastDelivery[tier].time}
                          onChange={(e) => handleExtraDeliveryChange(tier, 'time', parseInt(e.target.value))}
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          {[1, 2, 3].map((days) => (
                            <option key={days} value={days}>{days} Day{days > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Additional Price
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            value={formData.extraFastDelivery[tier].price}
                            onChange={(e) => handleExtraDeliveryChange(tier, 'price', parseInt(e.target.value))}
                            min="5"
                            className="block w-full pl-7 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={8}
                  className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200 resize-none ${
                    error ? 'border-red-500' : ''
                  }`}
                  placeholder="Describe your gig in detail..."
                  required
                />
                <div className="absolute bottom-2 right-2 text-sm text-gray-500">
                  {formData.description.length}/2000 characters
                </div>
              </div>
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Frequently Asked Questions</h3>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    faqs: [...prev.faqs, { question: '', answer: '' }]
                  }))}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  Add FAQ
                </button>
              </div>
              {formData.faqs.map((faq, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-md font-medium text-gray-900">FAQ {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        faqs: prev.faqs.filter((_, i) => i !== index)
                      }))}
                      className="text-red-600 hover:text-red-800 focus:outline-none"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Question
                    </label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => {
                        const newFaqs = [...formData.faqs];
                        newFaqs[index] = { ...faq, question: e.target.value };
                        setFormData(prev => ({ ...prev, faqs: newFaqs }));
                      }}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                      placeholder="Enter your question"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Answer
                    </label>
                    <textarea
                      value={faq.answer}
                      onChange={(e) => {
                        const newFaqs = [...formData.faqs];
                        newFaqs[index] = { ...faq, answer: e.target.value };
                        setFormData(prev => ({ ...prev, faqs: newFaqs }));
                      }}
                      rows={3}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                      placeholder="Enter your answer"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Get all the information you need from buyers to get started
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Add questions to help buyers provide you with exactly what you need to start working on their order.
              </p>
            </div>

            {/* SkillVerified Questions */}
            <div>
              <h4 className="flex items-center text-sm font-medium text-gray-900 mb-2">
                SKILLVERIFIED QUESTIONS
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  ?
                </span>
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                These optional questions will be added for all buyers.
              </p>

              <div className="space-y-4">
                {formData.requirements.map((req, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                          {req.type === 'multiple_choice' ? 'MULTIPLE CHOICE' : 'TEXT'}
                        </label>
                        <div className="flex items-start">
                          <div className="flex-grow">
                            <input
                              type="text"
                              value={req.question}
                              onChange={(e) => {
                                const newReqs = [...formData.requirements];
                                newReqs[index] = { ...req, question: e.target.value };
                                setFormData(prev => ({ ...prev, requirements: newReqs }));
                              }}
                              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              placeholder="Enter your question"
                            />
                            {req.type === 'multiple_choice' && req.choices && (
                              <div className="mt-2">
                                <input
                                  type="text"
                                  value={req.choices.join(', ')}
                                  onChange={(e) => {
                                    const newReqs = [...formData.requirements];
                                    newReqs[index] = {
                                      ...req,
                                      choices: e.target.value.split(',').map(c => c.trim())
                                    };
                                    setFormData(prev => ({ ...prev, requirements: newReqs }));
                                  }}
                                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                  placeholder="Enter choices (comma-separated)"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Questions */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-medium text-gray-900">YOUR QUESTIONS</h4>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      requirements: [
                        ...prev.requirements,
                        {
                          question: '',
                          type: 'text',
                          required: true
                        }
                      ]
                    }));
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  + Add New Question
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Here's where you can request any details needed to complete the order.
                There's no need to repeat any of the general questions asked above by Fiverr.
              </p>

              <div className="space-y-4">
                {formData.requirements.slice(2).map((req, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <select
                          value={req.type}
                          onChange={(e) => {
                            const newReqs = [...formData.requirements];
                            newReqs[index + 2].type = e.target.value as 'text' | 'multiple_choice';
                            setFormData(prev => ({ ...prev, requirements: newReqs }));
                          }}
                          className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          <option value="text">Free Text</option>
                          <option value="multiple_choice">Multiple Choice</option>
                        </select>
                        <div className="ml-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={req.required}
                              onChange={(e) => {
                                const newReqs = [...formData.requirements];
                                newReqs[index + 2].required = e.target.checked;
                                setFormData(prev => ({ ...prev, requirements: newReqs }));
                              }}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Answer required</span>
                          </label>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            requirements: [
                              ...prev.requirements.slice(0, index + 2),
                              ...prev.requirements.slice(index + 3)
                            ]
                          }));
                        }}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <input
                          type="text"
                          value={req.question}
                          onChange={(e) => {
                            const newReqs = [...formData.requirements];
                            newReqs[index + 2].question = e.target.value;
                            setFormData(prev => ({ ...prev, requirements: newReqs }));
                          }}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="Add a Question"
                        />
                      </div>
                      {req.type === 'multiple_choice' && (
                        <div>
                          <input
                            type="text"
                            value={req.choices?.join(', ') || ''}
                            onChange={(e) => {
                              const newReqs = [...formData.requirements];
                              newReqs[index + 2].choices = e.target.value.split(',').map(c => c.trim());
                              setFormData(prev => ({ ...prev, requirements: newReqs }));
                            }}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Add choices (comma-separated)"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {formData.requirements.length === 2 && (
                <p className="text-red-600 text-sm mt-4">
                  You must add at least 1 requirement
                </p>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Showcase Your Services In A Gig Gallery
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Encourage buyers to choose your Gig by featuring a variety of your work.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-500">
                  Help buyers find your services more easily by adding tags to all your work samples. To comply with Fiverr's terms of service, make sure to upload only content you either own or you have the permission or license to use.
                </p>
              </div>
            </div>

            {/* Gallery Section */}
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Required Skills <span className="text-red-500">*</span>
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  Specify the skills required for this gig.
                </p>
                <input
                  type="text"
                  value={formData.requiredSkills.join(', ')}
                  onChange={handleSkillsChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter required skills (comma-separated)"
                />
                {error && error.includes('required skill') && (
                  <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Images (minimum 1) <span className="text-red-500">*</span>
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  Get noticed by the right buyers with visual examples of your services.
                </p>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="images" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Upload images</span>
                        <input id="images" name="images" type="file" multiple accept="image/*" className="sr-only" onChange={handleImageChange} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img src={URL.createObjectURL(image)} alt={`Preview ${index + 1}`} className="h-32 w-full object-cover rounded-lg" />
                        <button onClick={() => removeImage(index)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Optional Video Upload */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Video (Optional)
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  Add a video to showcase your work in action.
                </p>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="video" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Upload video</span>
                        <input id="video" name="video" type="file" accept="video/*" className="sr-only" onChange={(e) => setFormData(prev => ({ ...prev, video: e.target.files?.[0] || null }))} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">MP4, MOV up to 100MB</p>
                  </div>
                </div>
                {formData.video && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">{formData.video.name}</p>
                    <button onClick={() => setFormData(prev => ({ ...prev, video: null }))} className="mt-2 text-sm text-red-600 hover:text-red-800">
                      Remove video
                    </button>
                  </div>
                )}
              </div>

              {/* Optional Documents Upload */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Documents (Optional)
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  Add any relevant documents or specifications.
                </p>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="documents" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Upload documents</span>
                        <input id="documents" name="documents" type="file" multiple accept=".pdf,.doc,.docx" className="sr-only" onChange={(e) => setFormData(prev => ({ ...prev, documents: Array.from(e.target.files || []) }))} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                  </div>
                </div>
                {formData.documents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">{doc.name}</span>
                        <button onClick={() => setFormData(prev => ({ ...prev, documents: prev.documents.filter((_, i) => i !== index) }))} className="text-red-600 hover:text-red-800">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Gig Summary</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Title</p>
                    <p className="font-medium">{formData.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium">{formData.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Delivery Time</p>
                    <p className="font-medium">{formData.deliveryTime} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Required Skills</p>
                    <p className="font-medium">{formData.requiredSkills.join(', ')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing & Commission</h3>
              <div className="space-y-6">
                {Object.entries(formData.packages).map(([tier, pkg]) => (
                  <div key={tier} className="border-b border-gray-200 pb-4 last:border-0">
                    <h4 className="font-medium capitalize mb-2">{tier} Package</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="font-medium">${pkg.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Commission (10%)</p>
                        <p className="font-medium text-red-600">${(pkg.price * COMMISSION_RATE).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Your Earnings</p>
                        <p className="font-medium text-green-600">${(pkg.price * (1 - COMMISSION_RATE)).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Delivery Time</p>
                        <p className="font-medium">{pkg.deliveryTime} days</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Commission Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Platform Commission Rate</span>
                  <span className="font-medium">10%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Your Earnings Rate</span>
                  <span className="font-medium text-green-600">90%</span>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    The commission helps us maintain the platform, provide support, and ensure secure transactions.
                    You'll receive your earnings after the order is completed and the client approves the delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="bg-white shadow-xl rounded-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Create a New Gig
              </h1>
              <p className="text-gray-600">
                Fill in the details to create your gig
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between px-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-200 ${
                        completedSteps.includes(step.id)
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : currentStep === step.id
                          ? 'bg-indigo-100 border-indigo-600 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500'
                      }`}
                    >
                      {completedSteps.includes(step.id) ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-sm">{step.id}</span>
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 mx-2 ${
                          completedSteps.includes(step.id) ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 px-4">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`text-xs font-medium flex-1 text-center ${
                      currentStep === step.id
                        ? 'text-indigo-600'
                        : completedSteps.includes(step.id)
                        ? 'text-gray-900'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="bg-gray-50 rounded-xl p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {steps[currentStep - 1].title}
                </h2>
                <p className="text-gray-600 mb-6">
                  {steps[currentStep - 1].description}
                </p>
                {renderStepContent()}
              </div>
            </div>

            <div className="flex justify-between mt-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  Back
                </button>
              )}
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 shadow-lg hover:shadow-xl ml-auto"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 shadow-lg hover:shadow-xl ml-auto"
                >
                  Create Gig
                </button>
              )}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};