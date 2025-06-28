import mongoose, { Schema, Document } from 'mongoose';

interface IPracticalSubmission {
  files: string[];
  
}

export interface ITestResult extends Document {
  skillId: string;
  userId: string;
  email?: string;
  score: number;
  passed: boolean;
  category?: string;
  screenRecording?: string;
  answers: [{ type: Number }],
  practicalSubmissions: IPracticalSubmission[];
  requiresEvaluation: boolean;
  evaluationStatus: 'pending' | 'completed' | 'failed';
  completedAt: Date;
  evaluatedAt: Date | null;
  evaluatorFeedback: string | null;
}

const PracticalSubmissionSchema = new Schema({
  files: [String],
});

const TestResultSchema = new Schema({
  skillId: { type: String, required: true },
  userId: { type: String, required: true },
  email: { type: String },  // Email field (will be populated from user data)
  score: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  category: { type: String },
  screenRecording: { type: String },
  answers: [{ type: Number }],
  practicalSubmissions: [PracticalSubmissionSchema],
  requiresEvaluation: { type: Boolean, default: false },
  evaluationStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  completedAt: { type: Date, default: Date.now },
  evaluatedAt: Date,
  evaluatorFeedback: String
});

// Create compound index for userId and skillId
TestResultSchema.index({ userId: 1, skillId: 1 }, { unique: true });

export const TestResultModel = mongoose.model<ITestResult>('TestResult', TestResultSchema, 'testresults'); 