export interface SkillCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  skills: Skill[];
  tests: Test[];
}

export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
}

export interface Test {
  id: string;
  name: string;
  type: 'quiz' | 'practical' | 'project';
  duration: number; // in minutes
  description: string;
  passingScore: number;
}

export const skillCategories: SkillCategory[] = [
  {
    id: 'web-development',
    name: 'Web Development',
    icon: '🌐',
    description: 'Create modern web applications using the latest technologies',
    skills: [
      { id: 'html-css', name: 'HTML & CSS', level: 'intermediate', description: 'Structure and style web pages' },
      { id: 'javascript', name: 'JavaScript', level: 'advanced', description: 'Build interactive web applications' },
      { id: 'react', name: 'React', level: 'advanced', description: 'Create component-based UIs' },
      { id: 'nextjs', name: 'Next.js', level: 'intermediate', description: 'Build server-side rendered apps' },
      { id: 'nodejs', name: 'Node.js', level: 'advanced', description: 'Develop scalable backend services' }
    ],
    tests: [
      { id: 'web-fundamentals', name: 'Web Development Fundamentals', type: 'quiz', duration: 45, description: 'Test your knowledge of HTML, CSS, and JavaScript', passingScore: 80 },
      { id: 'react-practical', name: 'React Component Building', type: 'practical', duration: 90, description: 'Create a functional React component', passingScore: 85 }
    ]
  },
  {
    id: 'mobile-development',
    name: 'Mobile App Development',
    icon: '📱',
    description: 'Build native and cross-platform mobile applications',
    skills: [
      { id: 'flutter', name: 'Flutter', level: 'advanced', description: 'Create cross-platform mobile apps' },
      { id: 'react-native', name: 'React Native', level: 'advanced', description: 'Build native mobile apps with React' },
      { id: 'swift', name: 'Swift', level: 'intermediate', description: 'Develop iOS applications' },
      { id: 'kotlin', name: 'Kotlin', level: 'intermediate', description: 'Create Android applications' }
    ],
    tests: [
      { id: 'mobile-ui', name: 'Mobile UI Development', type: 'practical', duration: 60, description: 'Create a responsive mobile interface', passingScore: 80 }
    ]
  },
  {
    id: 'ui-ux-design',
    name: 'UI/UX Design',
    icon: '🎨',
    description: 'Design beautiful and intuitive user interfaces and experiences',
    skills: [
      { id: 'figma', name: 'Figma', level: 'advanced', description: 'Create modern UI designs' },
      { id: 'adobe-xd', name: 'Adobe XD', level: 'intermediate', description: 'Design and prototype interfaces' },
      { id: 'wireframing', name: 'Wireframing', level: 'intermediate', description: 'Create structural website layouts' }
    ],
    tests: [
      { id: 'ui-design', name: 'UI Design Principles', type: 'practical', duration: 60, description: 'Create a landing page design', passingScore: 75 }
    ]
  },
  {
    id: 'content-writing',
    name: 'Content Writing',
    icon: '✍️',
    description: 'Create engaging and SEO-optimized content',
    skills: [
      { id: 'seo-writing', name: 'SEO Writing', level: 'advanced', description: 'Create search-engine optimized content' },
      { id: 'blog-writing', name: 'Blog Writing', level: 'intermediate', description: 'Write engaging blog posts' },
      { id: 'technical-writing', name: 'Technical Writing', level: 'advanced', description: 'Create technical documentation' }
    ],
    tests: [
      { id: 'content-creation', name: 'Content Creation', type: 'practical', duration: 45, description: 'Write an SEO-optimized article', passingScore: 80 }
    ]
  },
  {
    id: 'graphic-design',
    name: 'Graphic Design',
    icon: '🖼️',
    description: 'Create stunning visual content and branding materials',
    skills: [
      { id: 'photoshop', name: 'Adobe Photoshop', level: 'advanced', description: 'Edit and create images' },
      { id: 'illustrator', name: 'Adobe Illustrator', level: 'advanced', description: 'Create vector graphics' },
      { id: 'canva', name: 'Canva', level: 'intermediate', description: 'Design social media graphics' }
    ],
    tests: [
      { id: 'logo-design', name: 'Logo Design', type: 'practical', duration: 90, description: 'Create a brand logo', passingScore: 85 }
    ]
  },
  {
    id: 'digital-marketing',
    name: 'Digital Marketing',
    icon: '📈',
    description: 'Drive growth through digital marketing channels',
    skills: [
      { id: 'seo', name: 'SEO', level: 'advanced', description: 'Optimize for search engines' },
      { id: 'sem', name: 'SEM', level: 'intermediate', description: 'Manage search marketing campaigns' },
      { id: 'social-media', name: 'Social Media Marketing', level: 'advanced', description: 'Manage social media presence' }
    ],
    tests: [
      { id: 'marketing-strategy', name: 'Marketing Strategy', type: 'project', duration: 120, description: 'Create a marketing campaign', passingScore: 80 }
    ]
  },
  {
    id: 'data-science',
    name: 'Data Science',
    icon: '📊',
    description: 'Analyze data and build machine learning models',
    skills: [
      { id: 'python', name: 'Python', level: 'advanced', description: 'Program data analysis solutions' },
      { id: 'machine-learning', name: 'Machine Learning', level: 'advanced', description: 'Build ML models' },
      { id: 'data-visualization', name: 'Data Visualization', level: 'intermediate', description: 'Create data visualizations' }
    ],
    tests: [
      { id: 'data-analysis', name: 'Data Analysis', type: 'practical', duration: 90, description: 'Analyze a dataset', passingScore: 85 }
    ]
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    icon: '🔐',
    description: 'Protect systems and networks from cyber threats',
    skills: [
      { id: 'network-security', name: 'Network Security', level: 'advanced', description: 'Secure network infrastructure' },
      { id: 'ethical-hacking', name: 'Ethical Hacking', level: 'advanced', description: 'Identify system vulnerabilities' },
      { id: 'security-audit', name: 'Security Auditing', level: 'intermediate', description: 'Conduct security assessments' }
    ],
    tests: [
      { id: 'security-assessment', name: 'Security Assessment', type: 'practical', duration: 120, description: 'Perform a security audit', passingScore: 90 }
    ]
  },
  {
    id: 'virtual-assistance',
    name: 'Virtual Assistance',
    icon: '🧑‍💼',
    description: 'Provide professional administrative support',
    skills: [
      { id: 'admin-support', name: 'Administrative Support', level: 'intermediate', description: 'Provide admin assistance' },
      { id: 'calendar-management', name: 'Calendar Management', level: 'intermediate', description: 'Manage schedules' },
      { id: 'email-management', name: 'Email Management', level: 'intermediate', description: 'Handle email communications' }
    ],
    tests: [
      { id: 'va-skills', name: 'VA Skills Assessment', type: 'practical', duration: 60, description: 'Complete administrative tasks', passingScore: 80 }
    ]
  },
  {
    id: 'video-editing',
    name: 'Video Editing',
    icon: '🎬',
    description: 'Create and edit professional videos',
    skills: [
      { id: 'premiere-pro', name: 'Adobe Premiere Pro', level: 'advanced', description: 'Edit professional videos' },
      { id: 'after-effects', name: 'After Effects', level: 'advanced', description: 'Create motion graphics' },
      { id: 'capcut', name: 'CapCut', level: 'intermediate', description: 'Edit social media videos' }
    ],
    tests: [
      { id: 'video-editing', name: 'Video Editing', type: 'practical', duration: 90, description: 'Edit a video project', passingScore: 85 }
    ]
  }
];