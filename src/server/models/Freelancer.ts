import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String, required: true }
});

const educationSchema = new mongoose.Schema({
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  year: { type: Number, required: true }
});

const experienceSchema = new mongoose.Schema({
  years: { type: Number, required: true },
  description: { type: String, required: true }
});

const freelancerSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  title: { type: String, required: true },
  bio: { type: String, required: true },
  description: { type: String, required: false },
  languages: [{ type: String }],
  location: { type: String, required: true },
  profilePicture: { type: String },
  availability: { type: String, required: true },
  skills: [{ type: String }],
  experience: { type: String, required: false },
  education: { type: [educationSchema], required: false, default: [] },
  phone: { type: String, required: false },
  portfolio: { type: String, required: false },
  github: { type: String },
  linkedin: { type: String },
  website: { type: String },
  certifications: [{
    name: String,
    issuer: String,
    issueDate: String,
    expiryDate: String,
    credentialId: String,
    description: String,
    certificateFile: String
  }],
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  completedProjects: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

freelancerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Freelancer = mongoose.model('Freelancer', freelancerSchema); 