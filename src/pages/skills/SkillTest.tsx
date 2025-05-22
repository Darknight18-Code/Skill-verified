import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/use-toast';
import { ProctoredTest } from '../../components/skills/ProctoredTest';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../lib/api';
import { SkillTest as SkillTestType } from '../../types';
import { RecordRTCPromisesHandler } from 'recordrtc';

import { PracticalQuestionUpload } from '../../components/skills/PracticalQuestionUpload';
// Helper function to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Helper function to compress video using the browser's built-in compression
const compressVideo = async (blob: Blob, targetSizeMB: number = 2): Promise<Blob> => {
  console.log(`Compressing video from ${(blob.size / (1024 * 1024)).toFixed(2)} MB to target ~${targetSizeMB} MB`);
  
  // If the blob is already smaller than targetSizeMB, return it as is
  if (blob.size <= targetSizeMB * 1024 * 1024) {
    console.log('Video is already below the target size');
    return blob;
  }
  
  return new Promise((resolve, reject) => {
    try {
      // Convert blob to video element for processing
      const videoUrl = URL.createObjectURL(blob);
      const video = document.createElement('video');
      video.muted = true;
      video.autoplay = false;
      video.controls = false;
      video.src = videoUrl;
      
      video.onloadedmetadata = () => {
        // Create a canvas for compression
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Determine scaling factor based on input size vs target size
        const scaleFactor = Math.min(1, Math.sqrt(targetSizeMB * 1024 * 1024 / blob.size));
        
        // Calculate actual width and height by maintaining aspect ratio
        const width = Math.floor(video.videoWidth * scaleFactor);
        const height = Math.floor(video.videoHeight * scaleFactor);
        
        // Set canvas size to scaled dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Set up a MediaRecorder to record the compressed stream
        const stream = canvas.captureStream(30); // 30 FPS
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9',
          videoBitsPerSecond: Math.floor(targetSizeMB * 8 * 1024 * 1024 / (video.duration || 60))
        });
        
        const chunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        
        mediaRecorder.onstop = () => {
          // Create a new blob from the recorded chunks
          const compressedBlob = new Blob(chunks, { type: 'video/webm' });
          console.log(`Compressed video size: ${(compressedBlob.size / (1024 * 1024)).toFixed(2)} MB (${Math.round((compressedBlob.size / blob.size) * 100)}% of original)`);
          
          // Clean up resources
          URL.revokeObjectURL(videoUrl);
          resolve(compressedBlob);
        };
        
        // Start recording process
        mediaRecorder.start(100);
        
        // Play the video to draw frames on canvas
        video.play();
        
        // Draw frames onto the canvas
        const drawFrame = () => {
          if (video.paused || video.ended) {
            mediaRecorder.stop();
            return;
          }
          
          ctx.drawImage(video, 0, 0, width, height);
          requestAnimationFrame(drawFrame);
        };
        
        drawFrame();
        
        // Ensure we stop after the video ends
        video.onended = () => {
          setTimeout(() => {
            mediaRecorder.stop();
          }, 100);
        };
      };
      
      video.onerror = (err) => {
        reject(new Error(`Video loading error: ${err}`));
      };
      
    } catch (error) {
      console.error('Error during video compression:', error);
      reject(error);
    }
  });
};

export const SkillTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId } = useAuth();
  const [test, setTest] = useState<SkillTestType | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mcqCompleted, setMcqCompleted] = useState(false);
  const [practicalSubmissions, setPracticalSubmissions] = useState<Record<string, any>>({});
  const [screenRecording, setScreenRecording] = useState<Blob | null>(null);
  const setIsRecording = useState(false)[1];
  const [recordingCancelled, setRecordingCancelled] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const recorderRef = useRef<RecordRTCPromisesHandler | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetchTest();
    // Extra safety check: if the user has already taken this test, prevent them from retaking it
    if (testId && userId) {
      checkTestHistory();
    }
  }, [testId, userId]);

  const startRecording = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });

      // Disable pause button
      const videoTrack = displayStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.applyConstraints({
          // @ts-ignore - This is a non-standard property but works in Chrome
          displaySurface: 'browser',
          // @ts-ignore - This is a non-standard property but works in Chrome
          logicalSurface: true
        });
      }

      const recorder = new RecordRTCPromisesHandler(displayStream, {
        type: 'video',
        mimeType: 'video/webm;codecs=vp9',
        bitsPerSecond: 128000,
        frameInterval: 90,
        timeSlice: 1000,
        disableLogs: true,
        videoBitsPerSecond: 128000,
        checkForInactiveTracks: true
      });

      await recorder.startRecording();
      recorderRef.current = recorder;
      streamRef.current = displayStream;
      setIsRecording(true);
      setRecordingCancelled(false);

      // Handle stream stop
      displayStream.getVideoTracks()[0].onended = () => {
        stopRecording();
        setRecordingCancelled(true);
        toast({
          title: "Recording Cancelled",
          description: "Screen recording is required for this test. Please refresh the page to start again.",
          variant: "destructive",
        });
      };
    } catch (error) {
      console.error('Error starting screen recording:', error);
      setRecordingCancelled(true);
      toast({
        title: "Recording Error",
        description: "Failed to start screen recording. Please refresh the page to try again.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = async () => {
    if (recorderRef.current) {
      try {
        await recorderRef.current.stopRecording();
        const blob = await recorderRef.current.getBlob();
        setScreenRecording(blob);

        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        streamRef.current = null;
        recorderRef.current = null;
        setIsRecording(false);
      } catch (error) {
        console.error('Error stopping screen recording:', error);
        toast({
          title: "Recording Error",
          description: "Failed to stop screen recording.",
          variant: "destructive",
        });
      }
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recorderRef.current) {
        recorderRef.current.destroy();
      }
    };
  }, []);

  // Separate function to check test history and block access if already taken
  const checkTestHistory = async () => {
    try {
      console.log('Checking test history for user:', userId, 'and test:', testId);
      // Remove the duplicate /api prefix
      const testHistoryResponse = await api.get(`/tests/check/${testId}/${userId}`);
      
      if (testHistoryResponse.data && testHistoryResponse.data.hasAttempted) {
        console.log('User has already taken this test. Blocking access.');
        // Force immediate redirect
        navigate('/skills');
        
        // Delay showing the notification slightly to ensure redirect happens
        setTimeout(() => {
          showAlreadyTakenMessage(testHistoryResponse.data);
        }, 100);
        
        return true; // User has already taken the test
      }
      return false; // User has not taken the test
    } catch (error) {
      console.error('Error checking test history:', error);
      return false; // Continue on error
    }
  };
  
  // Function to show already taken message
  const showAlreadyTakenMessage = (testData: any) => {
    // Ensure we're still on the skills page before showing notification
    if (window.location.pathname.includes('/test/')) {
      navigate('/skills');
      return;
    }
    
    // Create a more visible notification
    const alreadyTakenNotification = document.createElement('div');
    alreadyTakenNotification.id = 'test-already-taken-notification';
    alreadyTakenNotification.style.position = 'fixed';
    alreadyTakenNotification.style.top = '0';
    alreadyTakenNotification.style.left = '0';
    alreadyTakenNotification.style.width = '100%';
    alreadyTakenNotification.style.height = '100%';
    alreadyTakenNotification.style.backgroundColor = 'rgba(0,0,0,0.9)';
    alreadyTakenNotification.style.display = 'flex';
    alreadyTakenNotification.style.alignItems = 'center';
    alreadyTakenNotification.style.justifyContent = 'center';
    alreadyTakenNotification.style.zIndex = '2147483647'; // Maximum z-index
    alreadyTakenNotification.style.color = 'white';
    alreadyTakenNotification.style.fontFamily = 'Arial, sans-serif';
    alreadyTakenNotification.style.padding = '20px';
    
    const messageContainer = document.createElement('div');
    messageContainer.style.backgroundColor = 'white';
    messageContainer.style.color = 'black';
    messageContainer.style.padding = '30px';
    messageContainer.style.borderRadius = '10px';
    messageContainer.style.maxWidth = '400px';
    messageContainer.style.textAlign = 'center';
    messageContainer.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    
    const title = document.createElement('h2');
    title.textContent = 'Test Already Completed ℹ️';
    title.style.color = '#3b82f6'; // Blue color
    title.style.marginBottom = '15px';
    title.style.fontSize = '24px';
    
    const message = document.createElement('p');
    message.textContent = 'You have already attempted this test. Each test can only be taken once.';
    message.style.marginBottom = '20px';
    message.style.lineHeight = '1.5';
    
    const details = document.createElement('p');
    details.textContent = testData.completedAt ? 
      `Completed on: ${new Date(testData.completedAt).toLocaleDateString()}` : 
      'Your previous submission is recorded in our system.';
    details.style.marginBottom = '20px';
    details.style.fontSize = '14px';
    details.style.color = '#6b7280'; // Gray color
    
    const button = document.createElement('button');
    button.textContent = 'Return to Skills Dashboard';
    button.style.backgroundColor = '#3b82f6';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.padding = '10px 20px';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.width = '100%';
    button.style.fontSize = '16px';
    
    button.onclick = () => {
      document.body.removeChild(alreadyTakenNotification);
    };
    
    messageContainer.appendChild(title);
    messageContainer.appendChild(message);
    messageContainer.appendChild(details);
    messageContainer.appendChild(button);
    alreadyTakenNotification.appendChild(messageContainer);
    
    // Add the notification to the DOM
    document.body.appendChild(alreadyTakenNotification);
    
    // Also show a toast notification
    toast({
      title: "Test Already Taken",
      description: "You have already attempted this test.",
      variant: "destructive",
    });
  };
  
  const fetchTest = async () => {
    try {
      // Check if user has already taken this test - this will redirect if already taken
      const alreadyTaken = await checkTestHistory();
      if (alreadyTaken) {
        return; // Stop execution if already taken
      }

      const response = await api.get(`/tests/${testId}`);
      if (!response.data) {
        throw new Error('Test not found');
      }
      setTest(response.data);
      // Start recording when test is loaded
      startRecording();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load test. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMcqAnswer = (questionIndex: number, answer: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleMcqSubmit = async () => {
    const mcqQuestions = test?.questions.filter(q => q.type === 'multiple-choice') || [];
    const allMcqAnswered = mcqQuestions.every((_, index) => answers[index] !== undefined);

    if (!allMcqAnswered) {
      toast({
        title: "Incomplete",
        description: "Please answer all multiple-choice questions before proceeding.",
        variant: "destructive",
      });
      return;
    }

    setMcqCompleted(true);
    toast({
      title: "Success",
      description: "Multiple-choice questions submitted successfully. You can now proceed to practical questions.",
    });
  };

  const handleTestComplete = async (submissionData: { testId: string; multipleChoiceAnswers: number[]; practicalSubmissions: { questionId: string; files: File[] }[] }) => {
    console.log('Received submission data from ProctoredTest:', submissionData);

    // Instead of updating state and waiting, directly call handleTestSubmit with latest answers
    // Prepare answers as an array, matching the expected order
    const proctoredAnswers = submissionData.multipleChoiceAnswers;
    const proctoredPractical = submissionData.practicalSubmissions;

    // Map practical submissions for handleTestSubmit
    const practicalMap: Record<string, File[]> = {};
    proctoredPractical.forEach((submission) => {
      practicalMap[submission.questionId] = submission.files;
    });

    // Call handleTestSubmit with explicit latest values
    await handleTestSubmit({
      answers: proctoredAnswers,
      practicalSubmissions: practicalMap
    });
  };

  const handleTestSubmit = async (
    override?: {
      answers?: number[];
      practicalSubmissions?: Record<string, File[]>;
    }
  ) => {
    console.log('Starting test submission process...');
    if (!test || !userId) {
      console.error('Missing test or userId:', { test, userId });
      throw new Error('Missing test or user information');
    }

    setIsSubmitting(true);
    try {
      // Use override if provided (from handleTestComplete)
      const answersToUse = override?.answers ?? answers;
      const practicalToUse = override?.practicalSubmissions ?? practicalSubmissions;

      console.log('Calculating MCQ score...');
      const mcqQuestions = test.questions.filter(q => q.type === 'multiple-choice');
      const mcqScore = mcqQuestions.reduce((score, q, index) => {
        return score + (answersToUse[index] === q.correctAnswer ? q.points : 0);
      }, 0);
      console.log('MCQ Score:', mcqScore);
      
      // First ensure we have the screen recording by stopping it properly
      let recordingBlob = screenRecording;
      if (recorderRef.current && !recordingBlob) {
        console.log('Stopping screen recording before submission...');
        try {
          await recorderRef.current.stopRecording();
          recordingBlob = await recorderRef.current.getBlob();
          setScreenRecording(recordingBlob);
          console.log('Screen recording captured successfully:', {
            size: `${(recordingBlob.size / (1024 * 1024)).toFixed(2)} MB`,
            type: recordingBlob.type
          });
          
          // Clean up the stream
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        } catch (error) {
          console.error('Error stopping screen recording:', error);
        }
      }
      
      // Compress the recording before submission if we have one
      if (recordingBlob) {
        try {
          console.log('Compressing screen recording before submission...');
          // Compress to target ~2MB size
          const compressedRecording = await compressVideo(recordingBlob, 2);
          recordingBlob = compressedRecording;
          console.log('Screen recording compressed successfully:', {
            originalSize: `${(screenRecording?.size || 0 / (1024 * 1024)).toFixed(2)} MB`,
            compressedSize: `${(compressedRecording.size / (1024 * 1024)).toFixed(2)} MB`,
            compressionRatio: `${Math.round((compressedRecording.size / (screenRecording?.size || 1)) * 100)}%`
          });
        } catch (error) {
          console.error('Error compressing screen recording:', error);
          // Continue with the original recording if compression fails
        }
      }
  
      // Create FormData object
      const formData = new FormData();
      formData.append('skillId', test.skillId);
      formData.append('userId', userId);
      formData.append('score', mcqScore.toString());
      formData.append('passed', (mcqScore >= test.passingScore).toString());
      formData.append('requiresEvaluation', 'true');
      
      // Add category information if available
      if (test.category) {
        formData.append('category', test.category);
      }
  
      // Format answers data
      const answersData = [];
      // Only send the answer indices as required by backend schema
      for (let i = 0; i < test.questions.length; i++) {
        const question = test.questions[i];
        if (question.type === 'multiple-choice' && answersToUse[i] !== undefined) {
          answersData.push(answersToUse[i]);
        }
      }
      console.log('Answers data to be sent:', answersData);
      formData.append('answers', JSON.stringify(answersData));
  
      // Format practical submissions
      const practicalData = [];
      // Attach actual files to FormData
      let practicalFileIndex = 0;
      for (const questionId in practicalToUse) {
        const files = practicalToUse[questionId];
        if (files && files.length > 0) {
          const fileNames = Array.from(files as File[]).map(file => file.name);
          practicalData.push({
            questionId: questionId,
            files: fileNames,
            status: 'pending'
          });
          Array.from(files as File[]).forEach((file, i) => {
            formData.append(`practicalFile_${questionId}_${i}`, file);
            practicalFileIndex++;
          });
        }
      }
      
      console.log('Practical submissions data to be sent:', practicalData);
      // Always append practicalSubmissions, even if empty
      formData.append('practicalSubmissions', JSON.stringify(practicalData));
  
      // Append screen recording with explicit naming
      if (recordingBlob) {
        console.log('Attaching screen recording to form submission:', {
          size: `${(recordingBlob.size / (1024 * 1024)).toFixed(2)} MB`,
          type: recordingBlob.type
        });
        formData.append('screenRecording', recordingBlob, 'screen-recording.webm');
        
        // Only use base64 as a last resort if the file is very small
        if (recordingBlob.size < 500 * 1024) { // Only for recordings < 500KB
          try {
            const base64Recording = await blobToBase64(recordingBlob);
            formData.append('screenRecordingBase64', base64Recording);
            console.log('Added base64 fallback for small screen recording');
          } catch (error) {
            console.error('Error converting recording to base64:', error);
          }
        }
      } else {
        console.warn('No screen recording available for submission');
      }

      // Log the form data entries to verify content
      console.log('Form data entries:');
      for (const pair of Array.from(formData.entries())) {
        if (pair[0] === 'screenRecording') {
          console.log(pair[0], 'File object included, size:', (pair[1] as Blob).size);
        } else if (pair[0] === 'screenRecordingBase64') {
          console.log(pair[0], 'Base64 string included (length):', (pair[1] as string).length);
        } else if (pair[0] === 'answers' || pair[0] === 'practicalSubmissions') {
          console.log(pair[0], 'JSON string included:', pair[1]);
          // Verify the JSON is valid
          try {
            const parsed = JSON.parse(pair[1] as string);
            console.log(`Parsed ${pair[0]} data:`, parsed);
          } catch (e) {
            console.error(`Error parsing ${pair[0]} JSON:`, e);
          }
        } else {
          console.log(pair[0], pair[1]);
        }
      }
      
      console.log('Submitting test to API...');
      const response = await api.post('/tests/submit', formData, {
        headers: {
          // IMPORTANT: Don't set Content-Type for FormData with files
          // Let the browser set it with the correct boundary
        },
        // Ensure proper handling of FormData
        transformRequest: [(data) => data],
      });
      console.log('API Response:', response.data);

      if (response.data && response.data.message === 'Test result recorded successfully') {
        console.log('Test submitted successfully');
        
        // Exit fullscreen if browser is in fullscreen mode
        try {
          // Handle various browser prefixes for fullscreen
          const docAny = document as any;
          
          if (document.fullscreenElement ||
              docAny.webkitFullscreenElement ||
              docAny.mozFullScreenElement ||
              docAny.msFullscreenElement) {
            
            if (document.exitFullscreen) {
              await document.exitFullscreen();
            } else if (docAny.webkitExitFullscreen) {
              await docAny.webkitExitFullscreen();
            } else if (docAny.mozCancelFullScreen) {
              await docAny.mozCancelFullScreen();
            } else if (docAny.msExitFullscreen) {
              await docAny.msExitFullscreen();
            }
            console.log('Exited fullscreen mode');
          }
        } catch (err) {
          console.error('Error exiting fullscreen:', err);
        }
        
        // Reset document styles that might have been set by ProctoredTest
        document.documentElement.style.overflow = '';
        document.documentElement.style.height = '';
        document.documentElement.style.position = '';
        document.documentElement.style.width = '';
        document.documentElement.style.top = '';
        document.documentElement.style.left = '';
        document.documentElement.style.zIndex = '';
        
        document.body.style.pointerEvents = '';
        document.body.style.userSelect = '';
        document.body.style.touchAction = '';
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.zIndex = '';
        
        // Show toast notification
        toast({
          title: "Test Submitted Successfully",
          description: "Your test has been submitted for evaluation.",
        });
        
        // Force display the success message using document.body.appendChild for maximum override
        setShowSuccessMessage(true);
        
        // Add a direct notification to the DOM as a fallback
        const successNotification = document.createElement('div');
        successNotification.id = 'direct-success-notification';
        successNotification.style.position = 'fixed';
        successNotification.style.top = '0';
        successNotification.style.left = '0';
        successNotification.style.width = '100%';
        successNotification.style.height = '100%';
        successNotification.style.backgroundColor = 'rgba(0,0,0,0.9)';
        successNotification.style.display = 'flex';
        successNotification.style.alignItems = 'center';
        successNotification.style.justifyContent = 'center';
        successNotification.style.zIndex = '2147483647'; // Maximum z-index
        successNotification.style.color = 'white';
        successNotification.style.fontFamily = 'Arial, sans-serif';
        successNotification.style.padding = '20px';
        
        const messageContainer = document.createElement('div');
        messageContainer.style.backgroundColor = 'white';
        messageContainer.style.color = 'black';
        messageContainer.style.padding = '30px';
        messageContainer.style.borderRadius = '10px';
        messageContainer.style.maxWidth = '400px';
        messageContainer.style.textAlign = 'center';
        messageContainer.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
        
        const title = document.createElement('h2');
        title.textContent = 'Test Submitted Successfully! ✓';
        title.style.color = '#16a34a'; // Green color
        title.style.marginBottom = '15px';
        title.style.fontSize = '24px';
        
        const message = document.createElement('p');
        message.textContent = 'Your test has been submitted for evaluation. You will be notified by email once the results are available.';
        message.style.marginBottom = '20px';
        message.style.lineHeight = '1.5';
        
        const button = document.createElement('button');
        button.textContent = 'Go to Skills Dashboard';
        button.style.backgroundColor = '#16a34a';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.padding = '10px 20px';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.width = '100%';
        button.style.fontSize = '16px';
        
        button.onclick = () => {
          document.body.removeChild(successNotification);
          navigate('/skills');
        };
        
        messageContainer.appendChild(title);
        messageContainer.appendChild(message);
        messageContainer.appendChild(button);
        successNotification.appendChild(messageContainer);
        
        // Using setTimeout to ensure other UI updates have completed
        setTimeout(() => {
          document.body.appendChild(successNotification);
        }, 100);
        
        return;
      } else {
        console.error('Unexpected response format:', response.data);
        throw new Error('Failed to submit test');
      }
    } catch (error: any) {
      console.error('Error submitting test:', error);
      toast({
        title: "Submission Failed",
        description: error.response?.data?.error || "Failed to submit test. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to be caught by the onComplete handler
    } finally {
      console.log('Submission process completed');
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Additional safety check - if for some reason the component still renders but the user has taken the test
    if (test && userId) {
      checkTestHistory();
    }
  }, [test]);

  if (!test) {
    return <div>Loading...</div>;
  }

  if (recordingCancelled) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Screen Recording Required</h2>
            <p className="text-gray-600 mb-4">
              Screen recording is required for this test. Please refresh the page to start again.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const isPracticalQuestion = currentQuestion.type === 'practical';
  const requiresSequentialCompletion = 'requiresSequentialCompletion' in test ? test.requiresSequentialCompletion : false;
  const canAccessPractical = !requiresSequentialCompletion || mcqCompleted;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Success message with extremely high z-index to override all other UI elements */}
      {showSuccessMessage && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-[99999]" 
          style={{ 
            position: 'fixed', 
            zIndex: 99999,
            pointerEvents: 'auto',
            userSelect: 'auto'
          }}
        >
          <Card className="p-6 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-green-600">Test Submitted Successfully! ✓</h2>
            <p className="text-gray-600 mb-6">
              Your test has been submitted for evaluation. You will be notified by email once the results are available.
            </p>
            <Button 
              onClick={() => navigate('/skills')} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Go to Skills Dashboard
            </Button>
          </Card>
        </div>
      )}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ProctoredTest
          test={test}
          onComplete={handleTestComplete}
          onViolation={() => {
            console.log('Test violation detected');
            toast({
              title: "Test Violation",
              description: "Warning: A test violation has been detected.",
              variant: "destructive",
            });
          }}
        >
          <Card className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{test.name}</h1>
              <p className="text-gray-600">{test.description}</p>
            </div>

            <Progress 
              value={(currentQuestionIndex / test.questions.length) * 100} 
              className="mb-6"
            />

            {isPracticalQuestion && !canAccessPractical ? (
              <div className="text-center py-8">
                <h2 className="text-xl font-semibold mb-4">Complete Multiple Choice Questions First</h2>
                <p className="text-gray-600 mb-4">
                  Please complete and submit all multiple-choice questions before accessing practical questions.
                </p>
                <Button onClick={() => setCurrentQuestionIndex(0)}>
                  Go to Multiple Choice Questions
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Question {currentQuestionIndex + 1}</h2>
                  <p className="text-gray-700">{currentQuestion.question}</p>
                </div>

                {currentQuestion.type === 'multiple-choice' ? (
                  <div className="space-y-4">
                    {currentQuestion.options?.map((option, index) => (
                      <Button
                        key={index}
                        variant={answers[currentQuestionIndex] === index ? "contained" : "outlined"}
                        className="w-full justify-start"
                        onClick={() => handleMcqAnswer(currentQuestionIndex, index)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">Requirements:</h3>
                      <p className="text-gray-600 whitespace-pre-line">{currentQuestion.requirements}</p>
                    </div>
                    
                    <PracticalQuestionUpload
                      question={currentQuestion}
                      existingFiles={practicalSubmissions[currentQuestion._id] || []}
                      onUpload={(files: File[]) => {
                        setPracticalSubmissions(prev => ({
                          ...prev,
                          [currentQuestion._id]: files
                        }));
                      }}
                    />
                  </div>
                )}

                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outlined"
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>

                  {currentQuestionIndex === test.questions.length - 1 ? (
                    <Button
                      onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
                        if (e) {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                        // Check for unanswered questions
                        const unansweredCount = test.questions.filter((q, idx) => 
                          q.type === 'multiple-choice' && answers[idx] === undefined
                        ).length;
                        
                        if (unansweredCount > 0) {
                          toast({
                            title: "Incomplete Test",
                            description: `You have ${unansweredCount} unanswered questions. Please complete all questions before submitting.`,
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        handleTestSubmit();
                      }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Test"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setCurrentQuestionIndex(prev => Math.min(test.questions.length - 1, prev + 1))}
                    >
                      Next
                    </Button>
                  )}
                </div>

                {!mcqCompleted && currentQuestion.type === 'multiple-choice' && (
                  <div className="mt-6">
                    <Button
                      onClick={handleMcqSubmit}
                      className="w-full"
                    >
                      Submit Multiple Choice Questions
                    </Button>
                  </div>
                )}
              </>
            )}
          </Card>
        </ProctoredTest>
      </div>
    </div>
  );
};