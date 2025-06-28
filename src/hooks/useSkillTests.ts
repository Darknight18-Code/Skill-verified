import { useState, useCallback } from 'react';
import { SkillTest, TestResult } from '../types';

export const useSkillTests = () => {
  const [tests, setTests] = useState<SkillTest[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch skill tests based on skillId
  const fetchTests = useCallback(async (skillId: string) => {
    if (!skillId) {
      setError('Invalid skill ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/skills/${skillId}/tests`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to fetch skill tests`);
      }

      const data: SkillTest[] = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      setTests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch skill tests');
      console.error('Error fetching tests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Submit test answers
  const takeTest = useCallback(async (testId: string, answers: number[]) => {
    if (!testId || answers.length === 0) {
      setError('Invalid test ID or answers');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('User is not authenticated');
      }

      const response = await fetch(`/api/tests/${testId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to submit test`);
      }

      const result: TestResult = await response.json();
      setResults(prev => [...prev, result]);

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit test');
      console.error('Error submitting test:', err);
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