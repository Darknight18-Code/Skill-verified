import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FadeIn } from '../animations/FadeIn';
import { ParallaxSection } from '../animations/ParallaxSection';
import { DollarSign, Star, Users } from 'lucide-react';

interface Certification {
  skillId: string;
  name: string;
  category: string;
  issuedAt: Date;
  score: number;
}

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  skills: string[];
  certifications: Certification[];
}

export const SellerHero = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleStartEarning = async () => {
    try {
      if (!user) {
        setMessage({
          type: 'error',
          text: 'Please sign in to continue.',
        });
        return;
      }

      // Fetch the latest user data from the server
      const response = await axios.get<UserData>(`/api/users/${user.id}`);
      const userData = response.data;
      
      console.log('User data:', {
        certifications: userData.certifications,
        skills: userData.skills
      });

      if (!userData.certifications || userData.certifications.length === 0) {
        setMessage({
          type: 'error',
          text: 'Please complete a skill assessment before you start selling on our platform.',
        });
      } else {
        // Check if user has passed at least one test
        const hasPassedTest = userData.certifications.some(cert => cert.score >= 70);
        console.log('Test pass check:', {
          hasPassedTest,
          certifications: userData.certifications.map(cert => ({
            name: cert.name,
            score: cert.score
          }))
        });

        if (!hasPassedTest) {
          setMessage({
            type: 'error',
            text: 'You need to pass at least one skill assessment before registering as a freelancer.',
          });
        } else {
          console.log('Navigating to freelancer registration...');
          navigate('/freelancer/register');
        }
      }
    } catch (error: any) {
      console.error('Error checking certifications:', error);
      setMessage({
        type: 'error',
        text: 'Failed to verify your certifications. Please try again.',
      });
    }
  };

  return (
    <ParallaxSection imageUrl="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80">
      <div className="bg-gradient-to-r from-indigo-600/90 to-purple-600/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <FadeIn>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
                Share Your Skills, Earn Your Worth
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                Join thousands of professionals who are turning their skills into success stories. Start earning on your terms.
              </p>
            </FadeIn>

            <FadeIn delay={0.4}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartEarning}
                className="bg-white text-indigo-600 px-8 py-4 rounded-md font-semibold text-lg shadow-lg"
              >
                Start Earning Today
              </motion.button>
            </FadeIn>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-4 rounded-lg text-white ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}
              >
                {message.text}
              </motion.div>
            )}

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: DollarSign, stat: '$20K+', label: 'Average Yearly Earnings' },
                { icon: Users, stat: '1M+', label: 'Active Buyers' },
                { icon: Star, stat: '4.9/5', label: 'Seller Satisfaction' },
              ].map((item, index) => (
                <FadeIn key={item.label} delay={0.2 * (index + 3)}>
                  <motion.div
                    className="bg-white/10 backdrop-blur-lg rounded-lg p-6"
                    whileHover={{ scale: 1.05 }}
                  >
                    <item.icon className="h-8 w-8 text-white mb-4 mx-auto" />
                    <div className="text-3xl font-bold text-white mb-2">{item.stat}</div>
                    <div className="text-indigo-100">{item.label}</div>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ParallaxSection>
  );
};
