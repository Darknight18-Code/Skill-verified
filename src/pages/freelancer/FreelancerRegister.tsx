import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { FadeIn } from '../../components/animations/FadeIn';
import Select from 'react-select';
import { countries, languages } from 'countries-list';

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  skills: string[];
  certifications: Array<{
    skillId: string;
    name: string;
    category: string;
    issuedAt: Date;
    score: number;
  }>;
}

interface FormData {
  // Personal Information
  bio: string;
  languages: string[];
  location: string;
  profilePicture: File | null;
  
  // Professional Information
  title: string;
  availability: string;
  experience: string;
  
  // Certifications
  certifications: Array<{
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate: string;
    credentialId: string;
    description: string;
    certificateFile: File | null;
  }>;
  
  // Work Experience
  workExperience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  
  // Skills & Expertise
  skills: string;
  expertise: string;
  tools: string;
  
  // Portfolio & Links
  portfolio: string;
  github: string;
  linkedin: string;
  website: string;
}

interface Step {
  id: number;
  title: string;
  description: string;
  icon: JSX.Element;
}

interface ValidationError {
  field: string;
  message: string;
}

interface Language {
  name: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Personal Info',
    description: 'Basic information about you',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Professional Details',
    description: 'Your professional background',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Certifications',
    description: 'Your professional certifications',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Experience',
    description: 'Your work experience',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 5,
    title: 'Skills & Portfolio',
    description: 'Your skills and portfolio links',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
];

// Convert countries object to array format for react-select
const countryOptions = Object.entries(countries).map(([code, country]) => ({
  value: code,
  label: country.name,
}));

// Convert languages object to array format for react-select
const languageOptions = Object.entries(languages).map(([code, language]) => ({
  value: code,
  label: language.name,
}));

export const FreelancerRegister = () => {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    bio: '',
    languages: [],
    location: '',
    profilePicture: null,
    title: '',
    availability: '',
    experience: '',
    certifications: [],
    workExperience: [],
    skills: '',
    expertise: '',
    tools: '',
    portfolio: '',
    github: '',
    linkedin: '',
    website: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const response = await axios.get(`/api/users/${user.id}`);
        console.log('User data response:', response.data);
        setUserData(response.data);
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        setError(err.response?.data?.error || 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchUserData();
    }
  }, [isLoaded, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number, field: 'certifications' | 'workExperience') => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item: any, i: number) => 
        i === index ? { ...item, [e.target.name]: value } : item
      )
    }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, {
        name: '',
        issuer: '',
        issueDate: '',
        expiryDate: '',
        credentialId: '',
        description: '',
        certificateFile: null
      }]
    }));
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleCertificateFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        certifications: prev.certifications.map((cert, i) => 
          i === index ? { ...cert, certificateFile: e.target.files![0] } : cert
        )
      }));
    }
  };

  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: ''
      }]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Get the primary email address from Clerk user
      const emailAddress = user.primaryEmailAddress?.emailAddress;
      if (!emailAddress) {
        setError('No email address found. Please ensure you have a primary email address set up.');
        return;
      }

      // Create FormData object to handle file uploads
      const formDataToSend = new FormData();
      
      // Add basic form data
      formDataToSend.append('userId', user.id);
      formDataToSend.append('email', emailAddress);
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('languages', JSON.stringify(formData.languages));
      formDataToSend.append('location', formData.location);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('availability', formData.availability);
      formDataToSend.append('experience', formData.experience);
      formDataToSend.append('skills', formData.skills);
      formDataToSend.append('expertise', formData.expertise);
      formDataToSend.append('tools', formData.tools);
      formDataToSend.append('portfolio', formData.portfolio);
      formDataToSend.append('github', formData.github);
      formDataToSend.append('linkedin', formData.linkedin);
      formDataToSend.append('website', formData.website);

      // Add profile picture if exists
      if (formData.profilePicture) {
        formDataToSend.append('profilePicture', formData.profilePicture);
      }

      // Add certifications if any
      formData.certifications.forEach((cert, index) => {
        formDataToSend.append(`certifications[${index}][name]`, cert.name);
        formDataToSend.append(`certifications[${index}][issuer]`, cert.issuer);
        formDataToSend.append(`certifications[${index}][issueDate]`, cert.issueDate);
        formDataToSend.append(`certifications[${index}][expiryDate]`, cert.expiryDate);
        formDataToSend.append(`certifications[${index}][credentialId]`, cert.credentialId);
        formDataToSend.append(`certifications[${index}][description]`, cert.description);
        if (cert.certificateFile) {
          formDataToSend.append(`certifications[${index}][certificateFile]`, cert.certificateFile);
        }
      });

      // Add work experience if any
      formData.workExperience.forEach((exp, index) => {
        formDataToSend.append(`workExperience[${index}][company]`, exp.company);
        formDataToSend.append(`workExperience[${index}][position]`, exp.position);
        formDataToSend.append(`workExperience[${index}][startDate]`, exp.startDate);
        formDataToSend.append(`workExperience[${index}][endDate]`, exp.endDate);
        formDataToSend.append(`workExperience[${index}][description]`, exp.description);
      });

      const response = await axios.post('/api/freelancers/register', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Registration successful:', response.data);
      navigate('/freelancer/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || 'Failed to complete registration');
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: ValidationError[] = [];

    switch (step) {
      case 1:
        if (formData.languages.length === 0) {
          errors.push({ field: 'languages', message: 'Languages are required' });
        }
        if (!formData.location.trim()) {
          errors.push({ field: 'location', message: 'Location is required' });
        }
        break;

      case 2:
        if (!formData.title.trim()) {
          errors.push({ field: 'title', message: 'Professional title is required' });
        }
        if (!formData.availability) {
          errors.push({ field: 'availability', message: 'Availability is required' });
        }
        if (!formData.bio.trim()) {
          errors.push({ field: 'bio', message: 'Professional bio is required' });
        }
        break;

      case 3:
        if (formData.certifications.length > 0) {
          formData.certifications.forEach((cert, index) => {
            if (!cert.name.trim()) {
              errors.push({ field: `certifications.${index}.name`, message: 'Certification name is required' });
            }
            if (!cert.issuer.trim()) {
              errors.push({ field: `certifications.${index}.issuer`, message: 'Issuing organization is required' });
            }
            if (!cert.issueDate) {
              errors.push({ field: `certifications.${index}.issueDate`, message: 'Issue date is required' });
            }
            if (!cert.description.trim()) {
              errors.push({ field: `certifications.${index}.description`, message: 'Description is required' });
            }
            if (!cert.certificateFile) {
              errors.push({ field: `certifications.${index}.certificateFile`, message: 'Certificate file is required' });
            }
          });
        }
        break;

      case 4:
        if (formData.workExperience.length > 0) {
          formData.workExperience.forEach((exp, index) => {
            if (!exp.company.trim()) {
              errors.push({ field: `workExperience.${index}.company`, message: 'Company name is required' });
            }
            if (!exp.position.trim()) {
              errors.push({ field: `workExperience.${index}.position`, message: 'Position is required' });
            }
            if (!exp.startDate) {
              errors.push({ field: `workExperience.${index}.startDate`, message: 'Start date is required' });
            }
            if (!exp.endDate) {
              errors.push({ field: `workExperience.${index}.endDate`, message: 'End date is required' });
            }
            if (!exp.description.trim()) {
              errors.push({ field: `workExperience.${index}.description`, message: 'Description is required' });
            }
          });
        }
        break;

      case 5:
        if (!formData.skills.trim()) {
          errors.push({ field: 'skills', message: 'Skills are required' });
        }
        if (!formData.expertise.trim()) {
          errors.push({ field: 'expertise', message: 'Areas of expertise are required' });
        }
        if (!formData.tools.trim()) {
          errors.push({ field: 'tools', message: 'Tools & technologies are required' });
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
      setValidationErrors([]);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setCompletedSteps(completedSteps.filter(step => step !== currentStep));
    setValidationErrors([]);
  };

  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);
  const isCurrentStep = (stepId: number) => currentStep === stepId;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        profilePicture: e.target.files![0]
      }));
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
                  {formData.profilePicture ? (
                    <img
                      src={URL.createObjectURL(formData.profilePicture)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <label
                  htmlFor="profilePicture"
                  className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="languages" className="block text-sm font-medium text-gray-700">
                  Languages <span className="text-red-500">*</span>
                </label>
                <Select
                  id="languages"
                  isMulti
                  name="languages"
                  options={languageOptions}
                  value={languageOptions.filter(option => formData.languages.includes(option.value))}
                  onChange={(selectedOptions) => {
                    setFormData(prev => ({
                      ...prev,
                      languages: selectedOptions ? selectedOptions.map(option => option.value) : []
                    }));
                  }}
                  className={`mt-1 ${
                    validationErrors.some(e => e.field === 'languages') ? 'border-red-500' : ''
                  }`}
                  classNamePrefix="select"
                  placeholder="Select languages..."
                  isSearchable
                  isClearable
                  required
                />
                {validationErrors.some(e => e.field === 'languages') && (
                  <p className="mt-1 text-sm text-red-600">Languages are required</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Country <span className="text-red-500">*</span>
                </label>
                <Select
                  id="location"
                  name="location"
                  options={countryOptions}
                  value={countryOptions.find(option => option.value === formData.location)}
                  onChange={(selectedOption) => {
                    setFormData(prev => ({
                      ...prev,
                      location: selectedOption ? selectedOption.value : ''
                    }));
                  }}
                  className={`mt-1 ${
                    validationErrors.some(e => e.field === 'location') ? 'border-red-500' : ''
                  }`}
                  classNamePrefix="select"
                  placeholder="Select a country..."
                  isSearchable
                  isClearable
                  required
                />
                {validationErrors.some(e => e.field === 'location') && (
                  <p className="mt-1 text-sm text-red-600">Country is required</p>
                )}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Professional Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200 ${
                  validationErrors.some(e => e.field === 'title') ? 'border-red-500' : ''
                }`}
                placeholder="e.g., Senior Full Stack Developer"
                required
              />
              {validationErrors.some(e => e.field === 'title') && (
                <p className="mt-1 text-sm text-red-600">Professional title is required</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                Availability <span className="text-red-500">*</span>
              </label>
              <select
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200 ${
                  validationErrors.some(e => e.field === 'availability') ? 'border-red-500' : ''
                }`}
                required
              >
                <option value="">Select availability</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="as-needed">As Needed</option>
              </select>
              {validationErrors.some(e => e.field === 'availability') && (
                <p className="mt-1 text-sm text-red-600">Availability is required</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Professional Bio <span className="text-red-500">*</span>
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200 ${
                  validationErrors.some(e => e.field === 'bio') ? 'border-red-500' : ''
                }`}
                placeholder="Tell potential clients about yourself..."
                required
              />
              {validationErrors.some(e => e.field === 'bio') && (
                <p className="mt-1 text-sm text-red-600">Professional bio is required</p>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Add Your Certifications (Optional)</h3>
              <button
                type="button"
                onClick={addCertification}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Certification
              </button>
            </div>
            {formData.certifications.map((cert, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-medium text-gray-900">Certification {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeCertification(index)}
                    className="text-red-600 hover:text-red-800 focus:outline-none"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Certification Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={cert.name}
                      onChange={(e) => handleArrayInputChange(e, index, 'certifications')}
                      className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200 ${
                        validationErrors.some(e => e.field === `certifications.${index}.name`) ? 'border-red-500' : ''
                      }`}
                      placeholder="e.g., AWS Certified Solutions Architect"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Issuing Organization
                    </label>
                    <input
                      type="text"
                      name="issuer"
                      value={cert.issuer}
                      onChange={(e) => handleArrayInputChange(e, index, 'certifications')}
                      className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200 ${
                        validationErrors.some(e => e.field === `certifications.${index}.issuer`) ? 'border-red-500' : ''
                      }`}
                      placeholder="e.g., Amazon Web Services"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      name="issueDate"
                      value={cert.issueDate}
                      onChange={(e) => handleArrayInputChange(e, index, 'certifications')}
                      className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200 ${
                        validationErrors.some(e => e.field === `certifications.${index}.issueDate`) ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={cert.expiryDate}
                      onChange={(e) => handleArrayInputChange(e, index, 'certifications')}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Credential ID
                    </label>
                    <input
                      type="text"
                      name="credentialId"
                      value={cert.credentialId}
                      onChange={(e) => handleArrayInputChange(e, index, 'certifications')}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                      placeholder="e.g., AWS-123456"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={cert.description}
                    onChange={(e) => handleArrayInputChange(e, index, 'certifications')}
                    rows={2}
                    className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200 ${
                      validationErrors.some(e => e.field === `certifications.${index}.description`) ? 'border-red-500' : ''
                    }`}
                    placeholder="Brief description of the certification and its significance"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Certificate
                  </label>
                  <div className="mt-1 flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        id={`certificate-${index}`}
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleCertificateFileChange(e, index)}
                        className={`block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-lg file:border-0
                          file:text-sm file:font-medium
                          file:bg-indigo-50 file:text-indigo-700
                          hover:file:bg-indigo-100
                          ${validationErrors.some(e => e.field === `certifications.${index}.certificateFile`) ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {cert.certificateFile && (
                      <span className="text-sm text-gray-500">
                        {cert.certificateFile.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Add Your Work Experience (Optional)</h3>
              <button
                type="button"
                onClick={addWorkExperience}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Experience
              </button>
            </div>
            {formData.workExperience.map((exp, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={exp.company}
                      onChange={(e) => handleArrayInputChange(e, index, 'workExperience')}
                      className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200 ${
                        validationErrors.some(e => e.field === `workExperience.${index}.company`) ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Position
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={exp.position}
                      onChange={(e) => handleArrayInputChange(e, index, 'workExperience')}
                      className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200 ${
                        validationErrors.some(e => e.field === `workExperience.${index}.position`) ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={exp.startDate}
                      onChange={(e) => handleArrayInputChange(e, index, 'workExperience')}
                      className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200 ${
                        validationErrors.some(e => e.field === `workExperience.${index}.startDate`) ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={exp.endDate}
                      onChange={(e) => handleArrayInputChange(e, index, 'workExperience')}
                      className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200 ${
                        validationErrors.some(e => e.field === `workExperience.${index}.endDate`) ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={exp.description}
                    onChange={(e) => handleArrayInputChange(e, index, 'workExperience')}
                    rows={3}
                    className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200 ${
                      validationErrors.some(e => e.field === `workExperience.${index}.description`) ? 'border-red-500' : ''
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                Skills (comma-separated) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200 ${
                  validationErrors.some(e => e.field === 'skills') ? 'border-red-500' : ''
                }`}
                placeholder="e.g., React, Node.js, Python"
                required
              />
              {validationErrors.some(e => e.field === 'skills') && (
                <p className="mt-1 text-sm text-red-600">Skills are required</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="expertise" className="block text-sm font-medium text-gray-700">
                Areas of Expertise <span className="text-red-500">*</span>
              </label>
              <textarea
                id="expertise"
                name="expertise"
                value={formData.expertise}
                onChange={handleInputChange}
                rows={3}
                className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200 ${
                  validationErrors.some(e => e.field === 'expertise') ? 'border-red-500' : ''
                }`}
                placeholder="Describe your areas of expertise..."
                required
              />
              {validationErrors.some(e => e.field === 'expertise') && (
                <p className="mt-1 text-sm text-red-600">Areas of expertise are required</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="tools" className="block text-sm font-medium text-gray-700">
                Tools & Technologies <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="tools"
                name="tools"
                value={formData.tools}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200 ${
                  validationErrors.some(e => e.field === 'tools') ? 'border-red-500' : ''
                }`}
                placeholder="e.g., Git, Docker, AWS"
                required
              />
              {validationErrors.some(e => e.field === 'tools') && (
                <p className="mt-1 text-sm text-red-600">Tools & technologies are required</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700">
                  Portfolio URL
                </label>
                <input
                  type="url"
                  id="portfolio"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                  placeholder="https://your-portfolio.com"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="github" className="block text-sm font-medium text-gray-700">
                  GitHub Profile
                </label>
                <input
                  type="url"
                  id="github"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                  placeholder="https://github.com/username"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Personal Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                  placeholder="https://your-website.com"
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/sign-in');
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="bg-white shadow-xl rounded-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Freelancer Profile
            </h1>
              <p className="text-gray-600">
                Showcase your skills and experience to potential clients
              </p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-200 ${
                        isStepCompleted(step.id)
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : isCurrentStep(step.id)
                          ? 'bg-indigo-100 border-indigo-600 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500'
                      }`}
                    >
                      {isStepCompleted(step.id) ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        step.icon
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-24 h-0.5 mx-4 ${
                          isStepCompleted(step.id) ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}
                      />
                    )}
                    </div>
                  ))}
              </div>
              <div className="flex justify-between mt-4">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`text-sm font-medium ${
                      isCurrentStep(step.id)
                        ? 'text-indigo-600'
                        : isStepCompleted(step.id)
                        ? 'text-gray-900'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </div>
                ))}
              </div>
              </div>

            {/* Current Step Content */}
            <div className="mb-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {steps[currentStep - 1].title}
                </h2>
                <p className="text-gray-600 mb-6">
                  {steps[currentStep - 1].description}
                </p>
                {renderStepContent()}
              </div>
              </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  Back
                </button>
              )}
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 shadow-lg hover:shadow-xl ml-auto"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 shadow-lg hover:shadow-xl ml-auto"
                >
                  Complete Registration
                </button>
              )}
              </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}; 