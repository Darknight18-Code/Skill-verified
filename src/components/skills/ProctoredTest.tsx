import React from 'react';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import Countdown from 'react-countdown';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import screenfull from 'screenfull';
import { AlertTriangle, Camera, Monitor, Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight, Users, Minimize2, Loader2 } from 'lucide-react';
import { FadeIn } from '../animations/FadeIn';
import { SkillTest, TestQuestion } from '../../types';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { PracticalQuestionUpload } from './PracticalQuestionUpload';
import { toast } from 'react-hot-toast';

// Add fullscreen styles
const FullscreenStyle = () => (
  <style>
    {`
      :fullscreen {
        background-color: white !important;
        width: 100vw !important;
        height: 100vh !important;
      }
      
      :-webkit-full-screen {
        background-color: white !important;
        width: 100vw !important;
        height: 100vh !important;
      }
      
      :-moz-full-screen {
        background-color: white !important;
        width: 100vw !important;
        height: 100vh !important;
      }

      /* Hide all browser UI elements */
      :fullscreen::-webkit-scrollbar {
        display: none !important;
      }
      
      :-webkit-full-screen::-webkit-scrollbar {
        display: none !important;
      }
      
      :-moz-full-screen::-webkit-scrollbar {
        display: none !important;
      }
    `}
  </style>
);

// Update the FullscreenOverlay component interface
interface FullscreenOverlayProps {
  onReenter: () => Promise<boolean>;
  onTerminate: () => void;
}

const FullscreenOverlay = ({ onReenter, onTerminate }: FullscreenOverlayProps) => {
  // Add a ref to track if we've already applied the blocking styles
  const stylesAppliedRef = React.useRef(false);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  
  // Apply blocking styles when the overlay is shown
  React.useEffect(() => {
    if (!stylesAppliedRef.current) {
      // Apply aggressive blocking styles to body and html
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100vh';
      document.documentElement.style.position = 'fixed';
      document.documentElement.style.width = '100%';
      document.documentElement.style.top = '0';
      document.documentElement.style.left = '0';
      document.documentElement.style.zIndex = '2147483647';
      
      document.body.style.pointerEvents = 'none';
      document.body.style.userSelect = 'none';
      document.body.style.touchAction = 'none';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.top = '0';
      document.body.style.left = '0';
      document.body.style.zIndex = '2147483647';
      
      // Force focus back to the window
      window.focus();
      
      // Prevent scrolling on the entire page
      const preventScroll = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
      
      document.addEventListener('scroll', preventScroll, { capture: true });
      document.addEventListener('touchmove', preventScroll, { capture: true });
      document.addEventListener('mousewheel', preventScroll, { capture: true });
      document.addEventListener('DOMMouseScroll', preventScroll, { capture: true });
      
      // Prevent tab switching and keyboard shortcuts
      const preventTabSwitch = (e: KeyboardEvent) => {
        // Block all keyboard shortcuts that might exit fullscreen or switch tabs
        if (e.key === 'Tab' || e.key === 'Alt' || e.key === 'Meta' || e.key === 'Control' || 
            e.key === 'F11' || e.key === 'Escape' || e.key === 'F4' || 
            (e.altKey && e.key === 'Tab') || (e.ctrlKey && e.key === 'Tab') || 
            (e.metaKey && e.key === 'Tab')) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }
      };
      
      document.addEventListener('keydown', preventTabSwitch, { capture: true });
      document.addEventListener('keyup', preventTabSwitch, { capture: true });
      document.addEventListener('keypress', preventTabSwitch, { capture: true });
      
      // Prevent window focus loss
      const preventBlur = () => {
        window.focus();
      };
      
      window.addEventListener('blur', preventBlur);
      
      // Prevent tab visibility change
      const preventVisibilityChange = () => {
        if (document.hidden) {
          document.title = "⚠️ WARNING: Return to the test immediately!";
          window.focus();
        } else {
          document.title = "Skill Test";
        }
      };
      
      document.addEventListener('visibilitychange', preventVisibilityChange);
      
      // Prevent right-click context menu
      const preventContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
      
      document.addEventListener('contextmenu', preventContextMenu, { capture: true });
      
      // Set up an interval to continuously check and refocus
      const focusInterval = setInterval(() => {
        if (document.hidden || !document.hasFocus()) {
          window.focus();
        }
      }, 100);
      
      // Mark styles as applied
      stylesAppliedRef.current = true;
      
      // Return cleanup function
      return () => {
        document.removeEventListener('scroll', preventScroll);
        document.removeEventListener('touchmove', preventScroll);
        document.removeEventListener('mousewheel', preventScroll);
        document.removeEventListener('DOMMouseScroll', preventScroll);
        document.removeEventListener('keydown', preventTabSwitch);
        document.removeEventListener('keyup', preventTabSwitch);
        document.removeEventListener('keypress', preventTabSwitch);
        window.removeEventListener('blur', preventBlur);
        document.removeEventListener('visibilitychange', preventVisibilityChange);
        document.removeEventListener('contextmenu', preventContextMenu);
        clearInterval(focusInterval);
        
        // Reset styles
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
        
        stylesAppliedRef.current = false;
      };
    }
  }, []);
  
  // Add a click handler to the overlay to prevent clicks from passing through
  const handleOverlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };
  
  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[2147483648]"
    style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(10px)',
      zIndex: 2147483648,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
        pointerEvents: 'all',
      userSelect: 'none',
      touchAction: 'none',
      WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none',
      WebkitTapHighlightColor: 'transparent',
        cursor: 'not-allowed'
    }}
      onContextMenu={(e) => e.preventDefault()}
      onClick={handleOverlayClick}
  >
    <div 
        className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative border-2 border-red-500"
      style={{
        pointerEvents: 'auto',
        userSelect: 'none',
          touchAction: 'none',
          position: 'relative',
          zIndex: 2147483649
      }}
    >
      <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-2xl font-bold text-red-600 mb-2">Warning: Fullscreen Required</h3>
          <p className="text-gray-700 mb-6">
            You must remain in fullscreen mode during the test. Exiting fullscreen mode may be considered a violation.
          </p>
          <div className="space-y-4">
        <button
          onClick={async () => {
            const success = await onReenter();
            if (!success) {
              alert("Failed to re-enter fullscreen mode. The test will be terminated.");
              onTerminate();
            }
          }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 w-full font-semibold transition-colors"
          style={{
            pointerEvents: 'auto',
            userSelect: 'none',
            touchAction: 'none'
          }}
        >
              Return to Fullscreen Mode
            </button>
            <button
              onClick={onTerminate}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 w-full font-semibold transition-colors"
              style={{
                pointerEvents: 'auto',
                userSelect: 'none',
                touchAction: 'none'
              }}
            >
              End Test
        </button>
          </div>
      </div>
    </div>
  </div>
);
};

interface ProctoredTestProps {
  test: SkillTest;
  onComplete: (submissionData: { testId: string; multipleChoiceAnswers: number[]; practicalSubmissions: { questionId: string; files: File[] }[] }) => void;
  onViolation: () => void;
  children: React.ReactNode;
}

// Update type declarations for webkit-specific properties
declare global {
  interface Document {
    webkitFullscreenElement?: Element;
    webkitExitFullscreen?: () => Promise<void>;
  }
  
  interface HTMLElement {
    webkitRequestFullscreen?: () => Promise<void>;
  }
}

export const ProctoredTest: React.FC<ProctoredTestProps> = ({ test, onComplete, onViolation, children }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [practicalMode, setPracticalMode] = React.useState(false);
  const [practicalQuestionId, setPracticalQuestionId] = React.useState<string | null>(null);

  // Return early if test is not loaded
  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {isLoading ? (
            <>
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading test...</p>
            </>
          ) : error ? (
            <>
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Retry
              </button>
            </>
          ) : null}
        </div>
      </div>
    );
  }

  // Now we can safely use test as it's not null
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [answers, setAnswers] = React.useState<number[]>(new Array(test.questions.length).fill(-1));
  const [practicalSubmissions, setPracticalSubmissions] = React.useState<Record<string, File[]>>({});
  const [webcamReady, setWebcamReady] = React.useState(false);
  const [violations, setViolations] = React.useState(0);
  const [testStarted, setTestStarted] = React.useState(false);
  const [faceDetected, setFaceDetected] = React.useState(false);
  const [multipleFaces, setMultipleFaces] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const isFullscreenRef = React.useRef(false);
  const [modelLoaded, setModelLoaded] = React.useState(false);
  const [showFullscreenModal, setShowFullscreenModal] = React.useState(false);
  
  const webcamRef = React.useRef<Webcam>(null);
  const faceDetectionInterval = React.useRef<number>();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const faceDetectionModel = React.useRef<blazeface.BlazeFaceModel | null>(null);
  const MAX_VIOLATIONS = 3;

  // Add a ref to store the test start time and remaining time
  const testStartTimeRef = React.useRef<number | null>(null);
  const remainingTimeRef = React.useRef<number | null>(null);

  // Initialize face detection model
  React.useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("Starting BlazeFace model loading process...");
        
        // First ensure TensorFlow backend is properly initialized
        await tf.ready();
        if (!tf.getBackend()) {
          console.log("Setting up WebGL backend...");
          await tf.setBackend('webgl');
        }
        console.log("TensorFlow backend:", tf.getBackend());

        // Check if model is already loaded
        if (faceDetectionModel.current) {
          console.log("Model already loaded");
          setModelLoaded(true);
          return;
        }

        console.log("Loading BlazeFace model...");
        const model = await blazeface.load();
        console.log("BlazeFace model loaded successfully");
        
        faceDetectionModel.current = model;
        setModelLoaded(true);

        // Start face detection if webcam is ready
        if (webcamRef.current?.video && webcamReady) {
          console.log("Starting face detection immediately...");
          await startFaceDetection();
        }
  
      } catch (error) {
        console.error("Error loading BlazeFace model:", error);
        faceDetectionModel.current = null;
        setModelLoaded(false);
        alert("Failed to initialize face detection. Please ensure you're using a modern browser with WebGL support.");
      }
    };

    loadModel();

    return () => {
      if (faceDetectionInterval.current) {
        window.clearInterval(faceDetectionInterval.current);
      }
      if (faceDetectionModel.current) {
        try {
          faceDetectionModel.current.dispose();
          faceDetectionModel.current = null;
        } catch (error) {
          console.error("Error disposing model:", error);
        }
      }
    };
  }, []);

  // Start face detection when webcam is ready
  const startFaceDetection = React.useCallback(async () => {
    if (!faceDetectionModel.current) {
      console.error("Face detection model not loaded");
      setModelLoaded(false);
      return;
    }

    if (!webcamRef.current?.video) {
      console.error("Webcam video not ready");
      return;
    }
    
    try {
      // Clear any existing interval
      if (faceDetectionInterval.current) {
        window.clearInterval(faceDetectionInterval.current);
      }

      // Wait for video to be ready
      const video = webcamRef.current.video;
      if (!video.readyState || video.readyState < 2) {
        console.log("Waiting for video to be ready...");
        await new Promise<void>((resolve) => {
          video.onloadeddata = () => resolve();
        });
      }

      // Ensure video is playing
      if (video.paused) {
        console.log("Video is paused, attempting to play...");
        try {
          await video.play();
        } catch (error) {
          console.error("Failed to play video:", error);
          return;
        }
      }

      console.log("Starting face detection with dimensions:", video.videoWidth, "x", video.videoHeight);

      let consecutiveNoFaceFrames = 0;
      let consecutiveMultiFaceFrames = 0;

      // Start new interval with error handling
      faceDetectionInterval.current = window.setInterval(async () => {
        if (!webcamRef.current?.video || video.paused || video.ended) {
          console.warn("Video stream not available");
          setFaceDetected(false);
          consecutiveNoFaceFrames++;
          if (testStarted && consecutiveNoFaceFrames >= 2 && !practicalMode) {
            handleViolation('No face detected');
          }
          return;
        }

        try {
          // Create a tensor from the video element
          const videoTensor = tf.browser.fromPixels(video);
          
          // Check tensor dimensions
          if (videoTensor.shape[0] === 0 || videoTensor.shape[1] === 0) {
            console.warn("Invalid video dimensions");
            videoTensor.dispose();
            consecutiveNoFaceFrames++;
            if (testStarted && consecutiveNoFaceFrames >= 2 && !practicalMode) {
              handleViolation('No face detected');
            }
            return;
          }

          const predictions = await faceDetectionModel.current!.estimateFaces(videoTensor, false);
          videoTensor.dispose(); // Clean up the tensor
          
          const numFaces = predictions.length;
          console.log("Face detection result:", numFaces, "faces detected");
          
          setFaceDetected(numFaces > 0);
          setMultipleFaces(numFaces > 1);

          if (testStarted && !practicalMode) {
            if (numFaces === 0) {
              consecutiveNoFaceFrames++;
              console.log("No face detected, consecutive frames:", consecutiveNoFaceFrames);
              if (consecutiveNoFaceFrames >= 2) {
                handleViolation('No face detected');
                // Reset counter after violation
                consecutiveNoFaceFrames = 0;
              }
            } else {
              consecutiveNoFaceFrames = 0;
            }

            if (numFaces > 1) {
              consecutiveMultiFaceFrames++;
              console.log("Multiple faces detected, consecutive frames:", consecutiveMultiFaceFrames);
              if (consecutiveMultiFaceFrames >= 2) {
                handleViolation('Multiple faces detected');
                // Reset counter after violation
                consecutiveMultiFaceFrames = 0;
              }
            } else {
              consecutiveMultiFaceFrames = 0;
            }
          }
        } catch (error) {
          console.error("Face detection error:", error);
          consecutiveNoFaceFrames++;
          if (testStarted && consecutiveNoFaceFrames >= 2 && !practicalMode) {
            handleViolation('No face detected');
            // Reset counter after violation
            consecutiveNoFaceFrames = 0;
          }
          setFaceDetected(false);
          setMultipleFaces(false);
        }
      }, 1000); // Check every second

    } catch (error) {
      console.error("Error starting face detection:", error);
      alert("Failed to start face detection. Please check your webcam and try again.");
    }
  }, [testStarted, practicalMode]); // Add practicalMode to dependencies

  const handleWebcamReady = React.useCallback(() => {
    console.log("Webcam ready callback triggered");
    setWebcamReady(true);
    
    // Start face detection if model is loaded
    if (modelLoaded && faceDetectionModel.current && webcamRef.current?.video) {
      console.log("Starting face detection from webcam ready callback");
      startFaceDetection();
    }
  }, [modelLoaded, startFaceDetection]);

  const startTest = async () => {
    if (!webcamReady || !modelLoaded) {
      console.log("Cannot start test: webcam ready:", webcamReady, "model loaded:", modelLoaded);
      return;
    }

    try {
      // First ensure webcam is properly initialized and face detection is working
      if (!faceDetected) {
        alert("Please ensure your face is detected before starting the test.");
        return;
      }

      // Setup event listeners first before any state changes
      setupEventListeners();

      // Start the test and store the start time
      setTestStarted(true);
      testStartTimeRef.current = Date.now();
      remainingTimeRef.current = test.timeLimit * 60000; // Store initial time limit in milliseconds
      
      // Request fullscreen
      await requestFullscreen();
    } catch (err) {
      console.error("Test start failed:", err);
      setTestStarted(false);
      testStartTimeRef.current = null;
      remainingTimeRef.current = null;
      alert("Failed to start the test. Please refresh the page and try again.");
    }
  };

  // Add kiosk mode styles function
  const applyKioskModeStyles = () => {
    // Remove any existing kiosk styles
    const existingStyles = document.querySelectorAll('style[data-kiosk-mode]');
    existingStyles.forEach(style => style.remove());

    const style = document.createElement('style');
    style.setAttribute('data-kiosk-mode', 'true');
    style.textContent = `
      * {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      *::-webkit-scrollbar {
        display: none;
      }
      html {
        background-color: white !important;
      }
      body {
        margin: 0 !important;
        padding: 0 !important;
        background-color: white !important;
        width: 100vw !important;
        height: 100vh !important;
      }
      :fullscreen, :-webkit-full-screen, :-moz-full-screen, :-ms-fullscreen {
        width: 100vw !important;
        height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        background-color: white !important;
      }
      .fullscreen-container {
        width: 100vw !important;
        height: 100vh !important;
        background: white !important;
        z-index: 2147483647 !important;
      }
    `;
    document.head.appendChild(style);

    // Apply styles to container
    if (containerRef.current) {
      containerRef.current.className = 'fullscreen-container';
    }

    // Force the window to be focused
    window.focus();
  };

  // Update the fullscreen request function
  const requestFullscreen = async (): Promise<boolean> => {
    const elem = document.documentElement;
    try {
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
        return true;
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to enter fullscreen mode:", error);
      return false;
    }
  };

  // Update the fullscreen checking effect
  React.useEffect(() => {
    const checkFullscreen = () => {
      const isFull = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(isFull);

      if (!isFull && testStarted && !practicalMode) {
        // Show the overlay and freeze ALL interaction
        setShowFullscreenModal(true);
        
        // Store current remaining time when exiting fullscreen
        if (testStartTimeRef.current) {
          const elapsed = Date.now() - testStartTimeRef.current;
          remainingTimeRef.current = Math.max(0, (test.timeLimit * 60000) - elapsed);
        }
        
        // Force focus back to the window
        window.focus();
        
        // Only mark violation if it's an intentional attempt to exit fullscreen
        const lastKeyPress = localStorage.getItem('lastKeyPress');
        const currentTime = Date.now();
        if (lastKeyPress && (currentTime - parseInt(lastKeyPress)) < 1000) {
        handleViolation('Fullscreen mode exited');
        }
      } else {
        // Reset all styles when fullscreen is re-entered
        setShowFullscreenModal(false);
        
        // Update start time to maintain the correct remaining time
        if (remainingTimeRef.current) {
          testStartTimeRef.current = Date.now() - ((test.timeLimit * 60000) - remainingTimeRef.current);
        }
      }
    };

    document.addEventListener("fullscreenchange", checkFullscreen);
    document.addEventListener("webkitfullscreenchange", checkFullscreen);

    return () => {
      document.removeEventListener("fullscreenchange", checkFullscreen);
      document.removeEventListener("webkitfullscreenchange", checkFullscreen);
    };
  }, [testStarted, practicalMode]);

  // Add useEffect to request fullscreen on mount
  React.useEffect(() => {
    if (testStarted && !practicalMode) {
      requestFullscreen();
    }
  }, [testStarted, practicalMode]);

  // Update the setupEventListeners function
  const setupEventListeners = () => {
    // Track key presses for violation detection
    const trackKeyPress = (e: KeyboardEvent) => {
      if (testStarted && !practicalMode) {
        localStorage.setItem('lastKeyPress', Date.now().toString());
      }
    };

    // Prevent keyboard shortcuts
    const preventExit = (e: KeyboardEvent) => {
      if (testStarted && !practicalMode) {
        // Check for keys that might exit fullscreen
        const exitKeys = ['Escape', 'F11', 'Alt+Tab', 'Alt+F4', 'Windows', 'Meta', 'Tab', 'Alt', 'Control'];
        
        if (exitKeys.includes(e.key) || e.altKey || e.metaKey || e.ctrlKey) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          
          // Immediately show the overlay and freeze background
          setShowFullscreenModal(true);
          
          // Force focus back to the window
          window.focus();
          
          // Apply aggressive blocking styles
          document.body.style.pointerEvents = 'none';
          document.body.style.userSelect = 'none';
          document.body.style.touchAction = 'none';
          document.body.style.overflow = 'hidden';
          document.body.style.position = 'fixed';
          document.body.style.width = '100%';
          document.body.style.height = '100%';
          document.body.style.top = '0';
          document.body.style.left = '0';
          document.body.style.zIndex = '2147483647';
          
          return false;
        }
      }
    };

    // Add event listeners with capture phase to ensure we catch the events first
    window.addEventListener('keydown', trackKeyPress, { capture: true });
    window.addEventListener('keydown', preventExit, { capture: true });
    window.addEventListener('keyup', preventExit, { capture: true });
    window.addEventListener('keypress', preventExit, { capture: true });

    // Also prevent keyboard shortcuts in the document
    document.addEventListener('keydown', trackKeyPress, { capture: true });
    document.addEventListener('keydown', preventExit, { capture: true });
    document.addEventListener('keyup', preventExit, { capture: true });
    document.addEventListener('keypress', preventExit, { capture: true });

    // Prevent context menu
    window.addEventListener('contextmenu', (e) => {
      if (testStarted && !practicalMode) {
        e.preventDefault();
        return false;
      }
    }, { capture: true });

    // Handle window focus
    window.addEventListener('blur', () => {
      if (testStarted && !practicalMode) {
        window.focus();
        handleViolation('Window focus lost');
      }
    });

    // Handle tab switching
    document.addEventListener('visibilitychange', () => {
      if (testStarted && document.hidden && !practicalMode) {
        handleViolation('Tab switched');
        window.focus();
        document.title = "⚠️ WARNING: Return to the test immediately!";
      } else if (testStarted && !document.hidden && !practicalMode) {
        document.title = "Skill Test";
      }
    });

    // Block navigation
    window.addEventListener('beforeunload', (e) => {
      if (testStarted) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    });

    // Additional prevention for fullscreen exit
    document.addEventListener('fullscreenchange', (e) => {
      if (testStarted && !document.fullscreenElement && !practicalMode) {
        e.preventDefault();
        setShowFullscreenModal(true);
        window.focus();
        // Apply aggressive blocking styles
        document.body.style.pointerEvents = 'none';
        document.body.style.userSelect = 'none';
        document.body.style.touchAction = 'none';
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.top = '0';
        document.body.style.left = '0';
        document.body.style.zIndex = '2147483647';
      }
    });

    // Type assertion for webkit fullscreen
    const webkitDocument = document as Document & {
      webkitFullscreenElement: Element | null;
    };

    document.addEventListener('webkitfullscreenchange', (e) => {
      if (testStarted && !webkitDocument.webkitFullscreenElement && !practicalMode) {
        e.preventDefault();
        setShowFullscreenModal(true);
        window.focus();
        // Apply aggressive blocking styles
        document.body.style.pointerEvents = 'none';
        document.body.style.userSelect = 'none';
        document.body.style.touchAction = 'none';
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.top = '0';
        document.body.style.left = '0';
        document.body.style.zIndex = '2147483647';
      }
    });
    
    // Set up an interval to continuously check and refocus
    const focusInterval = setInterval(() => {
      if (testStarted && !practicalMode && (document.hidden || !document.hasFocus())) {
        window.focus();
      }
    }, 100);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('keydown', trackKeyPress);
      window.removeEventListener('keydown', preventExit);
      window.removeEventListener('keyup', preventExit);
      window.removeEventListener('keypress', preventExit);
      document.removeEventListener('keydown', trackKeyPress);
      document.removeEventListener('keydown', preventExit);
      document.removeEventListener('keyup', preventExit);
      document.removeEventListener('keypress', preventExit);
      window.removeEventListener('contextmenu', (e) => {
        if (testStarted && !practicalMode) {
          e.preventDefault();
          return false;
        }
      });
      window.removeEventListener('blur', () => {
        if (testStarted && !practicalMode) {
          window.focus();
          handleViolation('Window focus lost');
        }
      });
      document.removeEventListener('visibilitychange', () => {
        if (testStarted && document.hidden && !practicalMode) {
          handleViolation('Tab switched');
          window.focus();
          document.title = "⚠️ WARNING: Return to the test immediately!";
        } else if (testStarted && !document.hidden && !practicalMode) {
          document.title = "Skill Test";
        }
      });
      window.removeEventListener('beforeunload', (e) => {
        if (testStarted) {
          e.preventDefault();
          e.returnValue = '';
          return '';
        }
      });
      document.removeEventListener('fullscreenchange', (e) => {
        if (testStarted && !document.fullscreenElement && !practicalMode) {
          e.preventDefault();
          setShowFullscreenModal(true);
          window.focus();
        }
      });
      document.removeEventListener('webkitfullscreenchange', (e) => {
        if (testStarted && !webkitDocument.webkitFullscreenElement && !practicalMode) {
          e.preventDefault();
          setShowFullscreenModal(true);
          window.focus();
        }
      });
      clearInterval(focusInterval);
    };
  };
  
  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handlePracticalUpload = async (questionId: string, files: File[]) => {
    try {
      // Store the files in the practicalSubmissions state
      console.log('Storing files for question:', questionId, files);
      
      // Update the practicalSubmissions state with the new files
      setPracticalSubmissions(prev => ({
        ...prev,
        [questionId]: files
      }));
      
      // Show success message
      toast.success('Files uploaded successfully');
    } catch (error) {
      console.error('Error uploading practical files:', error);
      toast.error('Failed to upload practical files');
    }
  };

  // Function to enter practical mode
  const enterPracticalMode = (questionId: string) => {
    setPracticalMode(true);
    setPracticalQuestionId(questionId);
    
    // Exit fullscreen if in fullscreen mode
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (document.webkitFullscreenElement) {
      document.webkitExitFullscreen?.();
    }
    
    // Reset body styles
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
  };

  // Function to exit practical mode
  const exitPracticalMode = async () => {
    setPracticalMode(false);
    setPracticalQuestionId(null);
    
    // Re-enter fullscreen
    await requestFullscreen();
  };

  const handleSubmitTest = async () => {
    // Only show unanswered questions warning if we're not in a fullscreen violation
    if (!showFullscreenModal) {
      // Count unanswered questions, considering both MCQ and practical questions
      const unansweredQuestions = test.questions.filter((question, index) => {
        if (question.type === 'multiple-choice') {
          return answers[index] === -1; // MCQ is unanswered
        } else if (question.type === 'practical') {
          // Practical question is unanswered if there are no files uploaded
          return !practicalSubmissions[question._id] || practicalSubmissions[question._id].length === 0;
        }
        return false;
      }).length;

      if (unansweredQuestions > 0) {
        if (!window.confirm(`You have ${unansweredQuestions} unanswered questions. Are you sure you want to submit?`)) {
          return;
        }
      }
    }
    
    // Exit fullscreen and complete test
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (document.webkitFullscreenElement) {
        await document.webkitExitFullscreen?.();
      }
    } catch (error) {
      console.error("Failed to exit fullscreen mode:", error);
    }
    
    // Prepare the submission data
    const submissionData = {
      testId: test._id,
      multipleChoiceAnswers: answers,
      practicalSubmissions: Object.entries(practicalSubmissions).map(([questionId, files]) => ({
        questionId,
        files
      }))
    };
    
    // Pass the submission data to the parent component
    onComplete(submissionData);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Test is complete, prepare the submission
      const submissionData = {
        testId: test._id,
        multipleChoiceAnswers: answers,
        practicalSubmissions: Object.entries(practicalSubmissions).map(([questionId, files]) => ({
          questionId,
          files
        }))
      };
      
      // For now, we'll just pass the multiple-choice answers to maintain compatibility
      // In a real implementation, you would need to modify the onComplete callback to handle both types
      onComplete(submissionData);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleViolation = (reason: string) => {
    console.log("Handling violation:", reason);
    setViolations(prevViolations => {
      const newViolations = prevViolations + 1;
      console.log("Violations updated:", newViolations);
    
    // Log violation
    console.warn(`Violation detected: ${reason}`);
    
    if (newViolations >= MAX_VIOLATIONS) {
        console.log("Max violations reached, calling onViolation");
      onViolation();
    }
      
      return newViolations;
    });
  };

  // Add a function to check if a question is answered
  const isQuestionAnswered = React.useCallback((questionIndex: number) => {
    const question = test.questions[questionIndex];
    if (!question) return false;
    
    if (question.type === 'multiple-choice') {
      return answers[questionIndex] !== -1 && answers[questionIndex] !== undefined;
    } else if (question.type === 'practical') {
      return practicalSubmissions[question._id] && practicalSubmissions[question._id].length > 0;
    }
    
    return false;
  }, [answers, practicalSubmissions, test.questions]);
  
  // Calculate if all questions are answered
  const isAllAnswered = React.useMemo(() => {
    return test.questions.every((_, index) => isQuestionAnswered(index));
  }, [test.questions, isQuestionAnswered]);

  // Render the current question based on its type
  const renderQuestion = () => {
    const question = test.questions[currentQuestion];
    if (!question) return <div>Question not found</div>;
    
    if (question.type === 'multiple-choice') {
      return (
        <MultipleChoiceQuestion
          question={question}
          onAnswer={(answerIndex) => handleAnswer(currentQuestion, answerIndex)}
          selectedAnswer={answers[currentQuestion]}
        />
      );
    } else if (question.type === 'practical') {
      // Check if this practical question has files uploaded
      const hasSubmission = practicalSubmissions[question._id] && 
                          practicalSubmissions[question._id].length > 0;
      
      return (
        <div>
          <PracticalQuestionUpload
            question={question}
            onUpload={(files) => handlePracticalUpload(question._id, files)}
            existingFiles={practicalSubmissions[question._id] || []}
          />
          
          {hasSubmission && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Files Uploaded</h3>
              <p className="text-green-700 mb-2">
                You have successfully uploaded {practicalSubmissions[question._id]?.length} file(s) for this question.
              </p>
              <ul className="list-disc pl-5 mb-2">
                {practicalSubmissions[question._id]?.map((file: File, index: number) => (
                  <li key={index} className="text-green-700">{file.name}</li>
                ))}
              </ul>
            </div>
          )}
          
          {!practicalMode ? (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Practical Question Mode</h3>
              <p className="text-blue-700 mb-4">
                This is a practical question that may require you to use external tools or applications.
                Click the button below to enter practical mode, which will allow you to exit fullscreen
                and work on your solution without triggering violations.
              </p>
              <button
                onClick={() => enterPracticalMode(question._id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Enter Practical Mode
              </button>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Practical Mode Active</h3>
              <p className="text-green-700 mb-4">
                You are currently in practical mode. You can exit fullscreen and work on your solution
                without triggering violations. When you're done, click the button below to return to
                the test.
              </p>
              <button
                onClick={exitPracticalMode}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Return to Test
              </button>
            </div>
          )}
        </div>
      );
    }
    
    return <div>Unsupported question type</div>;
  };

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && testStarted && !practicalMode) {
        handleViolation('Tab/window switched');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [testStarted, practicalMode]);

    return (
    <div 
      ref={containerRef} 
      tabIndex={-1} 
      className="min-h-screen bg-gray-50"
      style={{
        ...(isFullscreen ? {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          zIndex: 2147483647,
          backgroundColor: 'white',
          overflow: 'auto'
        } : {})
      }}
    >
      <FullscreenStyle />
      {showFullscreenModal && !practicalMode && (
        <FullscreenOverlay 
          onReenter={requestFullscreen}
          onTerminate={handleSubmitTest}
        />
      )}
      {!testStarted ? (
        <div className="max-w-4xl mx-auto p-6">
        <FadeIn>
            <div className="bg-white rounded-lg shadow-lg p-8 overflow-y-auto" style={{ maxHeight: isFullscreen ? 'calc(100vh - 2rem)' : 'none' }}>
              <h2 className="text-2xl font-bold">
                {test.name}
              </h2>
              
              {/* Test Requirements Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Test Requirements</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <Camera className="h-5 w-5 mr-2 text-indigo-600" />
                    Working webcam required
                  </li>
                  <li className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-indigo-600" />
                    Quiet environment recommended
                  </li>
                  <li className="flex items-center">
                    <Monitor className="h-5 w-5 mr-2 text-indigo-600" />
                    Browser permissions for camera access
                  </li>
                  <li className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-indigo-600" />
                    {test.timeLimit} minutes time limit
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-indigo-600" />
                    Passing score: 80%
                  </li>
                </ul>
              </div>

              {/* Enter Fullscreen Button */}
              {!isFullscreen && (
                <motion.button
                  onClick={async () => {
                    try {
                      const success = await requestFullscreen();
                      if (!success) {
                        alert("Failed to enter fullscreen mode. Please try again or use a different browser.");
                      }
                    } catch (error) {
                      console.error("Fullscreen request failed:", error);
                      alert("Failed to enter fullscreen mode. Please try again or use a different browser.");
                    }
                  }}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg mb-6 w-full font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Enter Fullscreen Mode to Continue
                </motion.button>
              )}

              {/* Webcam Setup Section - Only show if in fullscreen */}
              {isFullscreen && (
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 16rem)' }}>
                  <div className="border rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                      Webcam Setup
                </h3>
                {webcamReady ? (
                  <div className="aspect-video max-w-md mx-auto">
                    <Webcam
                      ref={webcamRef}
                      mirrored
                      className="rounded-lg w-full"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            minHeight: '200px'
                          }}
                          onUserMedia={() => {
                            console.log("Webcam initialized");
                            handleWebcamReady();
                          }}
                          videoConstraints={{
                            width: 640,
                            height: 480,
                            facingMode: "user",
                            aspectRatio: 1.333333
                          }}
                    />
                    <div className="mt-2 flex items-center justify-center space-x-4">
                      <span className={`flex items-center ${faceDetected ? 'text-green-500' : 'text-red-500'}`}>
                        {faceDetected ? <CheckCircle className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                        Face Detection
                      </span>
                      {multipleFaces && (
                        <span className="flex items-center text-red-500">
                          <Users className="h-4 w-4 mr-1" />
                          Multiple Faces Detected
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <motion.button
                      onClick={handleWebcamReady}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Enable Webcam
                    </motion.button>
                  </div>
                )}
              </div>

                  {/* Important Instructions */}
                  <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg mb-6">
                    <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-800">Important Instructions</h3>
                      <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                        <li>Stay within the browser window during the test</li>
                        <li>No additional screens or tabs allowed</li>
                        <li>Only one person should be visible in the webcam</li>
                        <li>Maintain good lighting conditions</li>
                        <li>Three violations will result in test termination</li>
                      </ul>
                    </div>
                  </div>

                  {/* Start Test Button */}
              <motion.button
                onClick={startTest}
                disabled={!webcamReady || !faceDetected || multipleFaces}
                className={`w-full py-3 rounded-lg font-semibold ${
                  webcamReady && faceDetected && !multipleFaces
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
                whileHover={webcamReady && faceDetected && !multipleFaces ? { scale: 1.02 } : {}}
                whileTap={webcamReady && faceDetected && !multipleFaces ? { scale: 0.98 } : {}}
              >
                Start Test
              </motion.button>
            </div>
              )}
          </div>
        </FadeIn>
      </div>
      ) : (
        <div className="container mx-auto px-4 py-6 h-full overflow-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FadeIn>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  Question {currentQuestion + 1} of {test.questions.length}
                </h2>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <Countdown
                    date={testStartTimeRef.current ? testStartTimeRef.current + (remainingTimeRef.current || test.timeLimit * 60000) : Date.now() + test.timeLimit * 60000}
                    onComplete={handleSubmitTest}
                    renderer={({ minutes, seconds }) => (
                      <span>{`${minutes}:${seconds.toString().padStart(2, '0')}`}</span>
                    )}
                  />
                </div>
              </div>

              <div className="mb-8">
                {renderQuestion()}
              </div>

              <div className="flex justify-between items-center">
                <motion.button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    currentQuestion === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-indigo-600 hover:bg-indigo-50'
                  }`}
                  whileHover={currentQuestion !== 0 ? { scale: 1.05 } : {}}
                  whileTap={currentQuestion !== 0 ? { scale: 0.95 } : {}}
                >
                  <ArrowLeft className="h-5 w-5 mr-1" />
                  Previous
                </motion.button>

                {currentQuestion === test.questions.length - 1 ? (
                  <motion.button
                    onClick={handleSubmitTest}
                    className={`px-6 py-2 rounded-lg ${
                      isAllAnswered
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isAllAnswered ? 'Submit Test' : 'Submit (Some Questions Unanswered)'}
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={handleNextQuestion}
                    className="flex items-center px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Next
                    <ArrowRight className="h-5 w-5 ml-1" />
                  </motion.button>
                )}
              </div>

              {/* Question Navigation */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Question Navigation</h3>
                <div className="flex flex-wrap gap-2">
                  {answers.map((answer, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        currentQuestion === index
                          ? 'bg-indigo-600 text-white'
                          : isQuestionAnswered(index)
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {index + 1}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="lg:col-span-1">
          <FadeIn>
                <div className="bg-white rounded-lg shadow-lg p-4 space-y-4 sticky top-6">
              <div className="aspect-video">
                <Webcam
                  ref={webcamRef}
                  mirrored
                  className="rounded-lg w-full"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        minHeight: '200px'
                      }}
                      onUserMedia={handleWebcamReady}
                      videoConstraints={{
                        width: 640,
                        height: 480,
                        facingMode: "user",
                        aspectRatio: 1.333333
                      }}
                />
              </div>

              <div className="p-4 rounded-lg bg-gray-50">
                <h3 className="font-semibold mb-2">Proctoring Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Camera className={`h-4 w-4 mr-2 ${faceDetected ? 'text-green-500' : 'text-red-500'}`} />
                    <span className="text-sm">Face Detection: {faceDetected ? 'Active' : 'Not Detected'}</span>
                  </div>
                  <div className="flex items-center">
                    <Monitor className={`h-4 w-4 mr-2 ${isFullscreen ? 'text-green-500' : 'text-red-500'}`} />
                    <span className="text-sm">Fullscreen: {isFullscreen ? 'Active' : 'Not Active'}</span>
                  </div>
                  <div className="flex items-center">
                    {violations < MAX_VIOLATIONS ? (
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2 text-red-500" />
                    )}
                    <span className="text-sm">
                      Violations: {violations}/{MAX_VIOLATIONS}
                    </span>
                  </div>
                  {multipleFaces && (
                    <div className="flex items-center text-red-500">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="text-sm">Multiple Faces Detected</span>
                    </div>
                  )}
                  {practicalMode && (
                    <div className="flex items-center text-blue-500">
                      <Minimize2 className="h-4 w-4 mr-2" />
                      <span className="text-sm">Practical Mode Active</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
        </div>
      )}
    </div>
  );
};