import { useCallback } from 'react';
import { useAuth } from './useAuth';

export const useSocialAuth = () => {
  const { setUser } = useAuth();

  const handleGoogleSignIn = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Google authentication failed');
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('auth_token', data.token);
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  }, [setUser]);

  const handleGithubSignIn = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/github', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('GitHub authentication failed');
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('auth_token', data.token);
    } catch (error) {
      console.error('GitHub sign-in error:', error);
    }
  }, [setUser]);

  return {
    handleGoogleSignIn,
    handleGithubSignIn,
  };
};