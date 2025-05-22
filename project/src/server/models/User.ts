import mongoose from 'mongoose';
import { User } from '../../types';

const userSchema = new mongoose.Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['freelancer', 'client'], required: true },
  createdAt: { type: Date, default: Date.now }
});

export const UserModel = mongoose.model<User>('User', userSchema);