// User model
export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'freelancer' | 'client' | 'admin';
  createdAt: Date;
  profileImage?: string;
  skills?: string[]; // Array of skill IDs
  certifications?: Certification[];
}

// SkillCategory model
export interface SkillCategory {
  _id: string;
  name: string;
  description: string;
  icon: string;
  skills: Skill[]; // Array of Skill objects
  tests: SkillTest[]; // Array of SkillTest objects
}

// Skill model
export interface Skill {
  _id: string;
  name: string;
  categoryId: string; // Reference to SkillCategory
  description: string;
  testId?: string; // Optional: Reference to SkillTest
}

// Certification model
export interface Certification {
  _id: string;
  userId: string;
  skillId: string;
  score: number;
  issuedAt: Date;
  expiresAt: Date;
  status: 'active' | 'expired';
}

// Freelancer model
export interface Freelancer {
  _id: string;
  userId: string;
  email: string;
  title: string;
  bio?: string;
  rating: number;
  totalReviews: number;
  profilePicture?: string;
  completedProjects?: number;
  isVerified: boolean;
}

// Package model for Gig pricing
export interface GigPackage {
  name: string;
  description: string;
  deliveryTime: number;
  revisions: number;
  numConcepts: number;
  price: number;
  features: {
    logoTransparency?: boolean;
    vectorFile?: boolean;
    printableFile?: boolean;
    threeDMockup?: boolean;
    sourceFile?: boolean;
    stationeryDesigns?: boolean;
    socialMediaKit?: boolean;
    [key: string]: boolean | undefined;
  };
}

// Gig model
export interface Gig {
  _id: string;
  freelancerId: string | Freelancer;
  userEmail: string;
  title: string;
  description: string;
  category: string;
  deliveryTime: number;
  packages: GigPackage[];
  extraFastDelivery?: {
    basic?: { enabled: boolean; price: number; time: number };
    standard?: { enabled: boolean; price: number; time: number };
    premium?: { enabled: boolean; price: number; time: number };
    [key: string]: { enabled: boolean; price: number; time: number } | undefined;
  };
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  requirements: Array<{
    question: string;
    type: 'text' | 'multiple_choice';
    choices?: string[];
    required: boolean;
  }>;
  images: string[];
  video?: string;
  documents: string[];
  requiredSkills: string[]; // Array of skill IDs
  searchTags: string[];
  status: 'active' | 'paused' | 'deleted';
  createdAt: Date;
  updatedAt?: Date;
}

// Project model
export interface Project {
  _id: string;
  clientId: string;
  freelancerId?: string;
  title: string;
  description: string;
  budget: {
    amount: number;
    currency: string;
  };
  requiredSkills: string[]; // Array of skill IDs
  status: 'open' | 'in-progress' | 'completed' | 'disputed';
  createdAt: Date;
  completedAt?: Date;
}

// Dispute model
export interface Dispute {
  _id: string;
  projectId: string;
  clientId: string;
  freelancerId: string;
  reason: string;
  description: string;
  status: 'open' | 'in-mediation' | 'resolved';
  resolution?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

// Payment model
export interface Payment {
  _id: string;
  projectId: string;
  clientId: string;
  freelancerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'held' | 'released' | 'refunded';
  createdAt: Date;
  releasedAt?: Date;
}

// SkillTest model
export interface SkillTest {
  _id: string;
  skillId: string;
  name: string;
  description: string;
  duration: number; // In minutes
  questions: TestQuestion[];
  passingScore: number;
  timeLimit: number;
  createdAt: Date;
  category?: string; // Category of the test
}

// TestQuestion model
export interface TestQuestion {
  _id: string;
  question: string;
  type: 'multiple-choice' | 'practical';
  options?: string[]; // Only for multiple-choice questions
  correctAnswer?: number; // Only for multiple-choice questions
  practicalType?: 'code' | 'video' | 'design' | '3d'; // For practical questions
  requirements?: string; // Description of what needs to be done
  fileTypes?: string[]; // Allowed file types for upload (e.g., ['.js', '.html', '.mp4'])
  maxFileSize?: number; // Maximum file size in MB
  points: number;
}

// TestResult model
export interface TestResult {
  _id: string;
  userId: string;
  testId: string;
  skillId: string;
  score: number;
  passed: boolean;
  completedAt: Date;
  answers: {
    questionId: string;
    answer: number | string[]; // For multiple-choice: index of answer, for practical: array of file URLs
    correct?: boolean; // Only for multiple-choice questions
  }[];
}
