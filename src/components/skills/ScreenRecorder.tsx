import React from 'react';
import RecordRTC, { RecordRTCPromisesHandler } from 'recordrtc';
import { AlertTriangle } from 'lucide-react';

interface ScreenRecorderProps {
  onRecordingStart: () => void;
  onRecordingStop: (blob: Blob) => void;
  onError: (error: string) => void;
}

export const ScreenRecorder: React.FC<ScreenRecorderProps> = ({
  onRecordingStart,
  onRecordingStop,
  onError
}) => {
  const [recorder, setRecorder] = React.useState<RecordRTCPromisesHandler | null>(null);
  const [isRecording, setIsRecording] = React.useState(false);
  const [stream, setStream] = React.useState<MediaStream | null>(null);

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

      const recorder = new RecordRTCPromisesHandler(displayStream, {
        type: 'video',
        mimeType: 'video/webm;codecs=vp9',
        bitsPerSecond: 128000,
        frameInterval: 90,
        timeSlice: 1000,
        disableLogs: true,
        videoBitsPerSecond: 128000,
        checkForInactiveTracks: true,
        ondataavailable: (blob: Blob) => {
          // Handle data chunks if needed
          console.log('Recording data available:', blob.size);
        }
      });

      await recorder.startRecording();
      setRecorder(recorder);
      setStream(displayStream);
      setIsRecording(true);
      onRecordingStart();

      // Handle stream stop
      displayStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };
    } catch (error) {
      console.error('Error starting screen recording:', error);
      onError('Failed to start screen recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (recorder) {
      try {
        await recorder.stopRecording();
        const blob = await recorder.getBlob();
        onRecordingStop(blob);

        // Clean up
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        setStream(null);
        setRecorder(null);
        setIsRecording(false);
      } catch (error) {
        console.error('Error stopping screen recording:', error);
        onError('Failed to stop screen recording.');
      }
    }
  };

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (recorder) {
        recorder.destroy();
      }
    };
  }, [stream, recorder]);

  return (
    <div className="flex items-center justify-center">
      {!isRecording && (
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-700 mb-4">
            Screen recording is required for this test. Please allow screen recording when prompted.
          </p>
          <button
            onClick={startRecording}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Start Screen Recording
          </button>
        </div>
      )}
    </div>
  );
}; 