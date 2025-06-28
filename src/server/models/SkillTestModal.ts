import mongoose, { Document, Schema } from 'mongoose';

// Test Question Interface
export interface ITestQuestion {
  question: string;
  type: 'multiple-choice' | 'practical';
  options?: string[];
  correctAnswer?: number; // Index of the correct option
  practicalType?: 'code' | 'video' | 'design' | '3d';
  requirements?: string;
  fileTypes?: string[];
  maxFileSize?: number;
  points: number;
  requiresScreenRecording?: boolean;
  evaluationRequired?: boolean;
}

// Skill Test Interface
export interface ISkillTest extends Document {
  skillId: string;
  name: string;
  category: string;
  description: string;
  duration: number; // Duration in minutes
  questions: ITestQuestion[];
  passingScore: number;
  timeLimit: number; // Time limit in minutes
  requiresSequentialCompletion: boolean;
  practicalQuestionsRequireRecording: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Test Question Schema
const testQuestionSchema = new Schema<ITestQuestion>({
  question: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['multiple-choice', 'practical'],
    default: 'multiple-choice'
  },
  options: { 
    type: [String], 
    validate: {
      validator: function(v: string[]) {
        // Only required for multiple-choice questions
        return this.type !== 'multiple-choice' || (v && v.length > 1);
      },
      message: 'Multiple-choice questions must have at least 2 options'
    }
  },
  correctAnswer: { 
    type: Number, 
    min: 0,
    validate: {
      validator: function(v: number) {
        // Only required for multiple-choice questions
        return this.type !== 'multiple-choice' || v !== undefined;
      },
      message: 'Multiple-choice questions must have a correct answer'
    }
  },
  practicalType: { 
    type: String, 
    enum: ['code', 'video', 'design', '3d'],
    validate: {
      validator: function(v: string) {
        // Only required for practical questions
        return this.type !== 'practical' || v !== undefined;
      },
      message: 'Practical questions must have a practical type'
    }
  },
  requirements: { type: String },
  fileTypes: { type: [String] },
  maxFileSize: { type: Number, min: 1 },
  points: { type: Number, required: true, min: 1 }, // Each question should have at least 1 point
  requiresScreenRecording: { type: Boolean, default: false },
  evaluationRequired: { type: Boolean, default: false }
});

// Skill Test Schema
const skillTestSchema = new Schema<ISkillTest>({
  skillId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true, min: 1 }, // Duration must be at least 1 minute
  questions: {
    type: [testQuestionSchema],
    required: true,
    validate: (v: ITestQuestion[]) => v.length > 0, // Ensures at least one question exists
  },
  passingScore: { type: Number, required: true, min: 0, max: 100 }, // Valid range: 0-100
  timeLimit: { type: Number, required: true, min: 1 }, // Minimum time limit should be 1 minute
  requiresSequentialCompletion: { type: Boolean, default: true },
  practicalQuestionsRequireRecording: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Validation middleware
skillTestSchema.pre('save', function(next) {
  if (this.questions.length === 0) {
    next(new Error('Test must have at least one question'));
  }
  
  // Validate multiple choice questions
  this.questions.forEach((question, index) => {
    if (question.type === 'multiple-choice') {
      if (!question.options || question.options.length === 0) {
        next(new Error(`Question ${index + 1} must have options`));
      }
      if (question.correctAnswer === undefined) {
        next(new Error(`Question ${index + 1} must have a correct answer`));
      }
    }
  });
  
  next();
});

export const SkillTestModel = mongoose.model<ISkillTest>('SkillTest', skillTestSchema);