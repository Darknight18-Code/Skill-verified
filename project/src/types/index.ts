export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'freelancer' | 'client' | 'admin';
  createdAt: Date;
  profileImage?: string;
  skills?: string[];
  certifications?: Certification[];
}

export interface Skill {
  _id: string;
  name: string;
  category: string;
  description: string;
  testId?: string;
}

export interface Certification {
  _id: string;
  userId: string;
  skillId: string;
  score: number;
  issuedAt: Date;
  expiresAt: Date;
  status: 'active' | 'expired';
}

export interface Gig {
  _id: string;
  freelancerId: string;
  title: string;
  description: string;
  category: string;
  price: {
    amount: number;
    currency: string;
  };
  deliveryTime: number;
  requiredSkills: string[];
  status: 'active' | 'pending' | 'rejected';
  createdAt: Date;
}

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
  requiredSkills: string[];
  status: 'open' | 'in-progress' | 'completed' | 'disputed';
  createdAt: Date;
  completedAt?: Date;
}

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

export interface SkillTest {
  _id: string;
  skillId: string;
  questions: TestQuestion[];
  passingScore: number;
  timeLimit: number;
  createdAt: Date;
}

export interface TestQuestion {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

export interface TestResult {
  _id: string;
  userId: string;
  testId: string;
  skillId: string;
  score: number;
  passed: boolean;
  completedAt: Date;
}