import { useState, useCallback } from 'react';
import { Dispute } from '../types';

export const useDisputes = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDispute = useCallback(async (disputeData: Partial<Dispute>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/disputes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(disputeData),
      });

      if (!response.ok) {
        throw new Error('Failed to create dispute');
      }

      const newDispute = await response.json();
      setDisputes(prev => [...prev, newDispute]);
      return newDispute;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create dispute');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDisputes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/disputes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch disputes');
      }

      const data = await response.json();
      setDisputes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch disputes');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDispute = useCallback(async (disputeId: string, updates: Partial<Dispute>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/disputes/${disputeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update dispute');
      }

      const updatedDispute = await response.json();
      setDisputes(prev => prev.map(dispute => 
        dispute._id === disputeId ? updatedDispute : dispute
      ));
      return updatedDispute;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update dispute');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    disputes,
    loading,
    error,
    createDispute,
    fetchDisputes,
    updateDispute,
  };
};