import { useState, useCallback } from 'react';
import { Gig } from '../types';

export const useGigs = () => {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGigs = useCallback(async (filters?: Record<string, any>) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryString = filters ? `?${new URLSearchParams(filters)}` : '';
      const response = await fetch(`/api/gigs${queryString}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch gigs');
      }

      const data = await response.json();
      setGigs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gigs');
    } finally {
      setLoading(false);
    }
  }, []);

  const createGig = useCallback(async (gigData: Partial<Gig>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/gigs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(gigData),
      });

      if (!response.ok) {
        throw new Error('Failed to create gig');
      }

      const newGig = await response.json();
      setGigs(prev => [...prev, newGig]);
      return newGig;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create gig');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGig = useCallback(async (gigId: string, updates: Partial<Gig>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/gigs/${gigId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update gig');
      }

      const updatedGig = await response.json();
      setGigs(prev => prev.map(gig => gig._id === gigId ? updatedGig : gig));
      return updatedGig;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update gig');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    gigs,
    loading,
    error,
    fetchGigs,
    createGig,
    updateGig,
  };
};