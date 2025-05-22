import { useState, useCallback } from 'react';
import { Payment } from '../types';

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = useCallback(async (paymentData: Partial<Payment>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const newPayment = await response.json();
      setPayments(prev => [...prev, newPayment]);
      return newPayment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const releasePayment = useCallback(async (paymentId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/payments/${paymentId}/release`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to release payment');
      }

      const updatedPayment = await response.json();
      setPayments(prev => prev.map(payment => 
        payment._id === paymentId ? updatedPayment : payment
      ));
      return updatedPayment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to release payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refundPayment = useCallback(async (paymentId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to refund payment');
      }

      const updatedPayment = await response.json();
      setPayments(prev => prev.map(payment => 
        payment._id === paymentId ? updatedPayment : payment
      ));
      return updatedPayment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refund payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    payments,
    loading,
    error,
    createPayment,
    releasePayment,
    refundPayment,
  };
};