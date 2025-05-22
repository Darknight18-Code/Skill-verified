import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FadeIn } from '../../../components/animations/FadeIn.tsx';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface TestSubmission {
  _id: string;
  userId: string;
  testId: string;
  score: number;
  passed: boolean;
  answers: Array<{
    questionId: string;
    answer: number;
    correct: boolean;
  }>;
  practicalSubmissions: Array<{
    questionId: string;
    files: string[];
    screenRecording?: string;
    status: 'pending' | 'evaluated';
    feedback?: string;
    score?: number;
  }>;
  evaluationStatus: 'pending' | 'in_progress' | 'completed';
  completedAt: string;
}

export const TestEvaluation = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = React.useState<TestSubmission | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<Record<string, string>>({});
  const [scores, setScores] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await axios.get(`/api/tests/evaluation/${testId}`);
        setSubmission(response.data.testResult);
        
        // Initialize feedback and scores
        const initialFeedback: Record<string, string> = {};
        const initialScores: Record<string, number> = {};
        response.data.practicalSubmissions.forEach((sub: any) => {
          initialFeedback[sub.questionId] = sub.feedback || '';
          initialScores[sub.questionId] = sub.score || 0;
        });
        setFeedback(initialFeedback);
        setScores(initialScores);
      } catch (err) {
        setError('Failed to fetch submission');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchSubmission();
    }
  }, [testId]);

  const handleSaveEvaluation = async () => {
    try {
      setLoading(true);
      // Convert feedback and scores into format expected by the API
      const practicalFeedback: Record<string, string> = {};
      const practicalScores: Record<string, number> = {};
      
      submission?.practicalSubmissions.forEach(sub => {
        practicalFeedback[sub.questionId] = feedback[sub.questionId] || '';
        practicalScores[sub.questionId] = scores[sub.questionId] || 0;
      });
      
      const evaluationData = {
        overallFeedback: '', // Add field for overall feedback if needed
        practicalFeedback,
        practicalScores,
        evaluationStatus: 'completed',
        passed: true // This should be based on a calculation or threshold
      };

      await axios.post(`/api/tests/evaluation/${testId}`, evaluationData);
      toast.success('Evaluation saved successfully');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error('Failed to save evaluation');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            {error || 'Submission not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Test Evaluation</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                submission.evaluationStatus === 'completed' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {submission.evaluationStatus}
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Submission Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="font-medium">{submission.userId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submitted</p>
                  <p className="font-medium">
                    {new Date(submission.completedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Multiple Choice Score</p>
                  <p className="font-medium">{submission.score}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{submission.passed ? 'Passed' : 'Failed'}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Practical Submissions</h2>
              <div className="space-y-6">
                {submission.practicalSubmissions.map((sub) => (
                  <div key={sub.questionId} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-4">Question ID: {sub.questionId}</h3>
                    
                    {/* Files */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Submitted Files</h4>
                      <div className="space-y-2">
                        {sub.files.map((file, index) => (
                          <a
                            key={index}
                            href={file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-indigo-600 hover:text-indigo-800"
                          >
                            View File {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Screen Recording */}
                    {sub.screenRecording && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Screen Recording</h4>
                        <a
                          href={sub.screenRecording}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          View Recording
                        </a>
                      </div>
                    )}

                    {/* Score Input */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Score (0-100)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={scores[sub.questionId]}
                        onChange={(e) => setScores({
                          ...scores,
                          [sub.questionId]: Number(e.target.value)
                        })}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>

                    {/* Feedback Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Feedback
                      </label>
                      <textarea
                        value={feedback[sub.questionId]}
                        onChange={(e) => setFeedback({
                          ...feedback,
                          [sub.questionId]: e.target.value
                        })}
                        rows={4}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEvaluation}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save Evaluation
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};