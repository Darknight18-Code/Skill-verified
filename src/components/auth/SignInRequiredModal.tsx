import React from 'react';
import { SignInButton } from '@clerk/clerk-react';

interface SignInRequiredModalProps {
  onClose?: () => void;
}

export const SignInRequiredModal: React.FC<SignInRequiredModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm p-6 text-center relative">
        {onClose && (
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        )}
        <h2 className="text-xl font-semibold mb-4">Please sign in to continue</h2>
        <SignInButton mode="modal">
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 mt-4"
          >
            Go to Sign In
          </button>
        </SignInButton>
      </div>
    </div>
  );
};
