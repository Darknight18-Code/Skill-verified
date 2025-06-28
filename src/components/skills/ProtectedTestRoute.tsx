import { useEffect, useState } from 'react';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../lib/api';
import { useToast } from '../ui/use-toast';
import { SkillTest } from '../../pages/skills/SkillTest';
import { SkillTest as SkillTestType } from '../../types';

export const ProtectedTestRoute = () => {
  const { testId } = useParams();
  const { userId } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasAttempted, setHasAttempted] = useState(false);
  // We'll use the test state instead of testData to avoid unused variables
  const [test, setTest] = useState<SkillTestType | null>(null);
  const [skillId, setSkillId] = useState<string>('');

  useEffect(() => {
    const fetchTestData = async () => {
      if (!testId) return;
      try {
        console.log('Fetching test data for ID:', testId);
        setLoading(true);
        const response = await api.get(`/tests/${testId}`);
        if (response.data) {
          setTest(response.data);
          setSkillId(response.data.skillId);
          console.log('Retrieved skillId:', response.data.skillId);
        }
      } catch (error: any) {
        console.error('Error fetching test:', error);
        toast({
          title: "Error",
          description: "Failed to load test information.",
          variant: "destructive",
        });
        navigate('/skills');
      }
    };
    
    fetchTestData();
  }, [testId, navigate, toast]);
  
  useEffect(() => {
    const checkTestHistory = async () => {
      if (!userId || !testId) return;
      
      try {
        console.log('Checking if user has already taken test:', testId, 'userId:', userId);
        // Check if the user has already taken this test by looking for an existing test result
        console.log(`Checking if user ${userId} has taken test ${testId}`);
        
        try {
          // Remove the duplicate /api prefix
          const checkResponse = await api.get(`/tests/check/${testId}/${userId}`);
          console.log('Test history check response:', checkResponse.data);
          
          if (checkResponse.data && checkResponse.data.hasAttempted) {
            // Set hasAttempted state directly with the response data
            setHasAttempted(true);
            setLoading(false);
            
            // Show notification after a small delay to ensure UI is ready
            setTimeout(() => {
              showAlreadyTakenMessage(checkResponse.data);
            }, 500);
            
            // Navigate immediately
            navigate('/skills');
            return { data: checkResponse.data };
          }
        } catch (error: any) {
          console.log('Error checking test history:', error.message);
        }
        
        // If we reach here, no submission was found
        const checkResponse = {
          data: {
            hasAttempted: false
          }
        };
        
        console.log('Manual test history check result:', checkResponse.data);
        
        if (checkResponse.data && checkResponse.data.hasAttempted) {
          console.log('User has already taken this test');
          setHasAttempted(true);
          
          // Show notification after redirect
          setTimeout(() => {
            showAlreadyTakenMessage(checkResponse.data);
          }, 500);
          
          // Navigate immediately
          navigate('/skills');
        } else {
          console.log('User has not taken this test yet');
        }
        
        setLoading(false);
      } catch (error: any) {
        console.error('Error checking test history:', error);
        // If we get a 404, it means the user hasn't taken the test
        if (error.response && error.response.status === 404) {
          console.log('User has not taken this test (404 response)');
          setLoading(false);
        } else {
          toast({
            title: "Error",
            description: "Failed to check test history.",
            variant: "destructive",
          });
          setLoading(false);
        }
      }
    };
    
    checkTestHistory();
  }, [testId, userId, navigate, toast]);

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

  if (loading) {
    return <div className="min-h-screen bg-gray-50 pt-20 flex justify-center items-center">
      <p className="text-xl">Checking test availability...</p>
    </div>;
  }
  
  // If user has attempted the test, they would have been redirected already
  // This is just a fallback
  if (hasAttempted) {
    return <Navigate to="/skills" />;
  }
  
  // Make sure we have the test data before rendering the SkillTest component
  if (!test) {
    return <div className="min-h-screen bg-gray-50 pt-20 flex justify-center items-center">
      <p className="text-xl">Loading test data...</p>
    </div>;
  }
  
  // All checks passed - user can take the test
  return <SkillTest />;
};
