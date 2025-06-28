import React, { useState, useEffect } from 'react';
import { Upload, File, X, AlertTriangle } from 'lucide-react';
import { TestQuestion } from '../../types';

interface PracticalQuestionUploadProps {
  question: TestQuestion;
  onUpload: (files: File[]) => void;
  existingFiles?: File[];
}

export const PracticalQuestionUpload: React.FC<PracticalQuestionUploadProps> = ({ 
  question, 
  onUpload,
  existingFiles = []
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize files from existingFiles prop
  useEffect(() => {
    if (existingFiles && existingFiles.length > 0) {
      setFiles(existingFiles);
    }
  }, [existingFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    
    // Validate file types
    if (question.fileTypes && question.fileTypes.length > 0) {
      const invalidFiles = newFiles.filter(file => {
        const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        return !question.fileTypes?.includes(extension);
      });
      
      if (invalidFiles.length > 0) {
        setError(`Invalid file type. Allowed types: ${question.fileTypes.join(', ')}`);
        return;
      }
    }
    
    // Validate file size
    if (question.maxFileSize) {
      const oversizedFiles = newFiles.filter(file => 
        file.size > question.maxFileSize! * 1024 * 1024
      );
      
      if (oversizedFiles.length > 0) {
        setError(`File too large. Maximum size: ${question.maxFileSize}MB`);
        return;
      }
    }
    
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    setError(null);
    onUpload(updatedFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onUpload(newFiles);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
      
      {question.requirements && (
        <div className="mb-4 p-4 bg-blue-50 rounded-md">
          <h4 className="font-medium text-blue-800 mb-2">Requirements:</h4>
          <p className="text-blue-700">{question.requirements}</p>
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload your work
        </label>
        
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <span>Upload files</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  multiple
                  onChange={handleFileChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              {question.fileTypes ? 
                `Allowed file types: ${question.fileTypes.join(', ')}` : 
                'All file types allowed'}
            </p>
            {question.maxFileSize && (
              <p className="text-xs text-gray-500">
                Maximum file size: {question.maxFileSize}MB
              </p>
            )}
          </div>
        </div>
        
        {error && (
          <div className="mt-2 flex items-center text-sm text-red-600">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <p>{error}</p>
          </div>
        )}
      </div>
      
      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded files:</h4>
          <ul className="divide-y divide-gray-200">
            {files.map((file, index) => (
              <li key={index} className="py-3 flex justify-between items-center">
                <div className="flex items-center">
                  <File className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{file.name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 