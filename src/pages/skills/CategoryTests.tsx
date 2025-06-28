import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FadeIn } from '../../components/animations/FadeIn';
import { skillCategories } from '../../data/skillCategories';
import { ArrowLeft, Clock, Award, CheckCircle } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../lib/api';
import { useToast } from '../../components/ui/use-toast';

export const CategoryTests = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const category = skillCategories.find(cat => cat.id === categoryId);
  
  // Function to check if user has already taken the test
  const checkTestHistory = async (testId: string) => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to take a test.",
        variant: "destructive",
      });
      return true; // Prevent navigation
    }
    
    setLoading(true);
    try {
      const response = await api.get(`/tests/${testId}/history/${userId}`);
      setLoading(false);
      
      if (response.data && response.data.hasAttempted) {
        // User has already taken this test
        showAlreadyTakenMessage(response.data);
        return true; // Prevent navigation
      }
      
      return false; // Allow navigation
    } catch (error) {
      setLoading(false);
      console.error('Error checking test history:', error);
      return false; // Allow navigation on error
    }
  };
  
  // Function to show a modal when user has already taken the test
  const showAlreadyTakenMessage = (testData: any) => {
    // Create a modal to show the message
    const modal = document.createElement('div');
    modal.id = 'test-already-taken-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '2147483647'; // Maximum z-index
    
    const messageBox = document.createElement('div');
    messageBox.style.backgroundColor = 'white';
    messageBox.style.padding = '2rem';
    messageBox.style.borderRadius = '0.5rem';
    messageBox.style.maxWidth = '500px';
    messageBox.style.width = '90%';
    messageBox.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
    
    const header = document.createElement('h2');
    header.textContent = 'Test Already Completed';
    header.style.fontSize = '1.5rem';
    header.style.fontWeight = 'bold';
    header.style.marginBottom = '1rem';
    header.style.color = '#3b82f6';
    
    const message = document.createElement('p');
    message.textContent = 'You have already taken this test. Each test can only be taken once.';
    message.style.marginBottom = '1rem';
    
    const completionInfo = document.createElement('p');
    if (testData.completedAt) {
      completionInfo.textContent = `Completed on: ${new Date(testData.completedAt).toLocaleDateString()}`;
    } else {
      completionInfo.textContent = 'Your submission has been recorded.';
    }
    completionInfo.style.fontSize = '0.875rem';
    completionInfo.style.color = '#6b7280';
    completionInfo.style.marginBottom = '1.5rem';
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.justifyContent = 'flex-end';
    buttonsContainer.style.gap = '0.5rem';
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.padding = '0.5rem 1rem';
    closeButton.style.backgroundColor = '#e5e7eb';
    closeButton.style.color = '#374151';
    closeButton.style.borderRadius = '0.25rem';
    closeButton.style.border = 'none';
    closeButton.style.cursor = 'pointer';
    
    closeButton.onclick = () => {
      document.body.removeChild(modal);
    };
    
    const dashboardButton = document.createElement('button');
    dashboardButton.textContent = 'View Skills Dashboard';
    dashboardButton.style.padding = '0.5rem 1rem';
    dashboardButton.style.backgroundColor = '#3b82f6';
    dashboardButton.style.color = 'white';
    dashboardButton.style.borderRadius = '0.25rem';
    dashboardButton.style.border = 'none';
    dashboardButton.style.cursor = 'pointer';
    
    dashboardButton.onclick = () => {
      document.body.removeChild(modal);
      navigate('/skills');
    };
    
    buttonsContainer.appendChild(closeButton);
    buttonsContainer.appendChild(dashboardButton);
    
    messageBox.appendChild(header);
    messageBox.appendChild(message);
    messageBox.appendChild(completionInfo);
    messageBox.appendChild(buttonsContainer);
    
    modal.appendChild(messageBox);
    document.body.appendChild(modal);
    
    // Also show a toast notification
    toast({
      title: "Test Already Taken",
      description: "You have already completed this test.",
      variant: "destructive",
    });
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-2xl font-bold text-gray-900">Category not found</h1>
          <button
            onClick={() => navigate('/skills')}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Return to Skills
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FadeIn>
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate('/skills')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Categories
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-4">{category.icon}</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
                <p className="text-gray-600">{category.description}</p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4">Available Tests</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.tests.map((test) => (
              <motion.div
                key={test.id}
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer"
                whileHover={{ y: -5 }}
                onClick={async () => {
                  // Check if user has already taken the test before navigating
                  const alreadyTaken = await checkTestHistory(test.id);
                  if (!alreadyTaken) {
                    navigate(`/skills/test/${test.id}`);
                  }
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{test.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    test.type === 'quiz' ? 'bg-blue-100 text-blue-800' :
                    test.type === 'practical' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {test.type.charAt(0).toUpperCase() + test.type.slice(1)}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{test.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {test.duration} min
                  </div>
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-1" />
                    {test.passingScore}% to pass
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}; 