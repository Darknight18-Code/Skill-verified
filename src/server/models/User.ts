import mongoose, { Document, Schema } from 'mongoose';

// User Interface for TypeScript
interface IUser extends Document {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  role: 'freelancer' | 'client' | 'admin';
  skills: string[];
  certifications: {
    skillId: string;
    name: string;
    category: string;
    issuedAt: Date;
    expiresAt?: Date;
    score: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// User Schema
const userSchema = new Schema<IUser>({
  clerkId: {
    type: String,
    required: [true, 'Clerk ID is required'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (v: string) => /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(v),
      message: 'Invalid email format',
    },
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  profileImage: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['freelancer', 'client', 'admin'],
    default: 'client',
  },
  skills: {
    type: [String],
    default: [],
  },
  certifications: {
    type: [
      {
        skillId: { type: String, required: true },
        name: { type: String, required: true },
        category: { type: String, required: true },
        issuedAt: { type: Date, required: true },
        expiresAt: { type: Date },
        score: { type: Number, required: true },
      },
    ],
    default: [],
  },
}, {
  timestamps: true,
});

export const UserModel = mongoose.model<IUser>('User', userSchema);
