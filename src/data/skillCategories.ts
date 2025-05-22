import { SkillTestModel } from '../server/models/SkillTestModal';

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
  type: 'quiz';
  duration: number; // in minutes
  description: string;
  passingScore: number;
}

// Base skill categories structure with dummy duration values
// Will be updated with actual durations from database
const baseSkillCategories: SkillCategory[] = [
  {
    id: 'web-development',
    name: 'Web Development',
    icon: '🌐',
    description: 'Create modern web applications using the latest technologies',
    skills: [
      { id: 'mern-stack', name: 'MERN STACK', level: 'intermediate', description: 'Structure and style web pages' },
      { id: 'mevn-stack', name: 'MEVN STACK', level: 'advanced', description: 'Build interactive web applications' },
      { id: 'lamp-stack', name: 'LAMP STACK', level: 'advanced', description: 'Create component-based UIs' },
      { id: 'django-stack', name: 'DJANGO STACK', level: 'intermediate', description: 'Build server-side rendered apps' },
      { id: 'jam-stack', name: 'JAM STACK', level: 'advanced', description: 'Develop scalable backend services' }
    ],
    tests: [
      { id: 'mern-stack', name: 'MERN-STACK', type: 'quiz', duration: 0, description: 'Test your knowledge of HTML, CSS, and JavaScript', passingScore: 80 },
      { id: 'mevn-stack', name: 'MEVN-STACK', type: 'quiz', duration: 0, description: 'Create a functional React component', passingScore: 85 },
      { id: 'lamp-stack', name: 'LAMP-STACK', type: 'quiz', duration: 0, description: 'Test your knowledge of HTML, CSS, and JavaScript', passingScore: 80 },
      { id: 'django-stack', name: 'DJANGO-STACK', type: 'quiz', duration: 0, description: 'Test your knowledge of HTML, CSS, and JavaScript', passingScore: 80 },
      { id: 'jam-stack', name: 'JAM-STACK', type: 'quiz', duration: 0, description: 'Test your knowledge of HTML, CSS, and JavaScript', passingScore: 80 },
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
      { id: 'flutter', name: 'FLUTTER', type: 'quiz', duration: 0, description: 'Create a responsive mobile interface', passingScore: 80 },
      { id: 'react-native', name: 'REACT NATIVE', type: 'quiz', duration: 0, description: 'Create a responsive mobile interface', passingScore: 80 },
      { id: 'swift', name: 'SWIFT', type: 'quiz', duration: 0, description: 'Create a responsive mobile interface', passingScore: 80 },
      { id: 'kotlin', name: 'KOTLIN', type: 'quiz', duration: 0, description: 'Create a responsive mobile interface', passingScore: 80 }
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
      { id: 'figma', name: 'FIGMA', type: 'quiz', duration: 0, description: 'Create a landing page design', passingScore: 75 },
      { id: 'adobe-xd', name: 'ADOBE XD', type: 'quiz', duration: 0, description: 'Create a landing page design', passingScore: 75 },
      { id: 'wireframing', name: 'WIREFRAMING', type: 'quiz', duration: 0, description: 'Create a landing page design', passingScore: 75 }
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
      { id: 'seo-writing', name: 'SEO WRITING', type: 'quiz', duration: 0, description: 'Write an SEO-optimized article', passingScore: 80 },
      { id: 'blog-writing', name: 'BLOG WRITING', type: 'quiz', duration: 0, description: 'Write an SEO-optimized article', passingScore: 80 },
      { id: 'technical-writing', name: 'TECHNICAL WRITING', type: 'quiz', duration: 0, description: 'Write an SEO-optimized article', passingScore: 80 }
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
      { id: 'photoshop', name: 'PHOTOSHOP', type: 'quiz', duration: 0, description: 'Create a brand logo', passingScore: 85 },
      { id: 'illustrator', name: 'ILLUSTRATOR', type: 'quiz', duration: 0, description: 'Create a brand logo', passingScore: 85 },
      { id: 'canva', name: 'CANVA', type: 'quiz', duration: 0, description: 'Create a brand logo', passingScore: 85 }
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
      { id: 'seo', name: 'Marketing Strategy', type: 'quiz', duration: 0, description: 'Create a marketing campaign', passingScore: 80 },
      { id: 'sem', name: 'Marketing Strategy', type: 'quiz', duration: 0, description: 'Create a marketing campaign', passingScore: 80 },
      { id: 'social-media', name: 'Marketing Strategy', type: 'quiz', duration: 0, description: 'Create a marketing campaign', passingScore: 80 }
    ]
  },
  {
    id: 'social-media-management',
    name: 'Social Media Management',
    icon: '📱',
    description: 'Manage and grow social media presence for businesses',
    skills: [
      { id: 'content-strategy', name: 'Content Strategy', level: 'intermediate', description: 'Create engaging social media content plans' },
      { id: 'community-management', name: 'Community Management', level: 'intermediate', description: 'Engage with followers and build community' },
      { id: 'analytics', name: 'Social Media Analytics', level: 'intermediate', description: 'Track and analyze social media performance' }
    ],
    tests: [
      { id: 'content-strategy', name: 'CONTENT STRATEGY', type: 'quiz', duration: 0, description: 'Create a social media content calendar', passingScore: 80 },
      { id: 'community-management', name: 'COMMUNITY MANAGEMENT', type: 'quiz', duration: 0, description: 'Create a social media content calendar', passingScore: 80 },
      { id: 'analytics', name: 'ANALYTICS', type: 'quiz', duration: 0, description: 'Create a social media content calendar', passingScore: 80 }
    ]
  },
  {
    id: '3d-animation-video',
    name: '3D Animation & Video',
    icon: '🎬',
    description: 'Create stunning 3D animations and videos',
    skills: [
      { id: 'blender', name: 'Blender', level: 'advanced', description: 'Create 3D models and animations' },
      { id: 'maya', name: 'Maya', level: 'advanced', description: 'Develop professional 3D animations' },
      { id: 'after-effects', name: 'After Effects', level: 'intermediate', description: 'Create motion graphics and visual effects' }
    ],
    tests: [
      { id: 'blender', name: 'BLENDER', type: 'quiz', duration: 0, description: 'Create a 3D model and animation', passingScore: 80 },
      { id: 'maya', name: 'MAYA', type: 'quiz', duration: 0, description: 'Create a 3D model and animation', passingScore: 80 },
      { id: 'after-effects', name: 'AFTER EFFECTS', type: 'quiz', duration: 0, description: 'Create a 3D model and animation', passingScore: 80 }
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
      { id: 'premiere-pro', name: 'PREMIERE PRO', type: 'quiz', duration: 0, description: 'Edit a video project', passingScore: 85 },
      { id: 'after-effects', name: 'AFTER EFFECTS', type: 'quiz', duration: 0, description: 'Edit a video project', passingScore: 85 },
      { id: 'capcut', name: 'CAPCUT', type: 'quiz', duration: 0, description: 'Edit a video project', passingScore: 85 }
    ]
  }
];

// Export both the static data and async function for getting updated data with real durations
export const skillCategories = baseSkillCategories;

// Function to fetch skill tests with duration from the database
export async function getSkillCategoriesWithDurations(): Promise<SkillCategory[]> {
  try {
    // Always use the static skills array from baseSkillCategories.
    // Only update the test durations, never overwrite or modify the skills array.
    const updatedCategories = JSON.parse(JSON.stringify(baseSkillCategories));
    
    // Get all skill tests from the database
    const skillTests = await SkillTestModel.find({}).lean();
    
    // Create a mapping of test IDs to timeLimit values
    const testTimeMap = new Map();
    skillTests.forEach(test => {
      if (test.skillId) {
        testTimeMap.set(test.skillId, test.timeLimit);
      }
    });
    
    // Only update test durations, never touch the skills array
    updatedCategories.forEach((category: SkillCategory) => {
      category.tests.forEach(test => {
        if (testTimeMap.has(test.id)) {
          test.duration = testTimeMap.get(test.id);
        }
      });
    });
    
    return updatedCategories;
  } catch (error) {
    console.error('Error fetching test durations:', error);
    // Return the base categories with dummy values if there's an error
    return baseSkillCategories;
  }
}