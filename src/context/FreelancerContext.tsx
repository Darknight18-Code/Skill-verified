import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';

interface FreelancerContextType {
  isFreelancer: boolean;
  isVerified: boolean;
  loading: boolean;
}

const FreelancerContext = createContext<FreelancerContextType>({
  isFreelancer: false,
  isVerified: false,
  loading: true,
});

export const useFreelancer = () => useContext(FreelancerContext);

export const FreelancerProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const [isFreelancer, setIsFreelancer] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFreelancerStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/freelancers/${user.id}`);
        setIsFreelancer(true);
        setIsVerified(response.data.isVerified);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setIsFreelancer(false);
          setIsVerified(false);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancerStatus();
  }, [user]);

  return (
    <FreelancerContext.Provider value={{ isFreelancer, isVerified, loading }}>
      {children}
    </FreelancerContext.Provider>
  );
}; 