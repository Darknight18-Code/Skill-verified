import React from 'react';
import { TestQuestion } from '../../types';

interface MultipleChoiceQuestionProps {
  question: TestQuestion;
  onAnswer: (answerIndex: number) => void;
  selectedAnswer?: number;
}

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  onAnswer,
  selectedAnswer
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
      
      <div className="space-y-3">
        {question.options?.map((option, index) => (
          <div 
            key={index}
            className={`p-3 border rounded-md cursor-pointer transition-colors ${
              selectedAnswer === index 
                ? 'bg-indigo-50 border-indigo-500' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => onAnswer(index)}
          >
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                selectedAnswer === index 
                  ? 'border-indigo-500 bg-indigo-500' 
                  : 'border-gray-400'
              }`}>
                {selectedAnswer === index && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                )}
              </div>
              <span className="text-gray-800">{option}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 