import { useState, useCallback } from 'react';
import { SkillTest, TestResult } from '../types';

export const useSkillTests = () => {
  const [tests, setTests] = useState<SkillTest[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTests = useCallback(async (skillId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/skills/${skillId}/tests`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch skill tests');
      }

      const data = await response.json();
      setTests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch skill tests');
    } finally {
      setLoading(false);
    }
  }, []);

  const takeTest = useCallback(async (testId: string, answers: number[]) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/tests/${testId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit test');
      }

      const result = await response.json();
      setResults(prev => [...prev, result]);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit test');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tests,
    results,
    loading,
    error,
    fetchTests,
    takeTest,
  };
};