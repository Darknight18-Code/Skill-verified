import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import busboy from 'busboy';
import clerkWebhooks from '../api/webhooks/clerk';
import { UserModel } from '../server/models/User';
import { SkillTestModel } from '../server/models/SkillTestModal';
import { Freelancer } from './models/Freelancer';
import { TestResultModel } from './models/TestResult';
import { Gig } from './models/Gig';
import cloudinary, { uploadToCloudinary, uploadMultipleToCloudinary } from '../config/cloudinary';
import { Payment } from './models/Payment';
import paymentsRouter from './payments';

dotenv.config();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const apiRouter = Router();

// Configure multer for other file uploads that still need it
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  }
});

// Webhook route (must be before express.json())
app.use('/api/webhooks', express.raw({ type: 'application/json' }), clerkWebhooks);

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Add request logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillcertified')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Add type definition for multer files
interface MulterFiles {
  [fieldname: string]: Express.Multer.File[];
}

// Add this type definition before the endpoint
interface GigPackage {
  name: string;
  description: string;
  deliveryTime: number;
  revisions: number;
  price: number;
  features: string[];
}

// Get skill categories with their tests
apiRouter.get('/skill-categories', async (req, res) => {
  try {
    const categories = await require('../data/skillCategories').getSkillCategoriesWithDurations();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching skill categories:', error);
    res.status(500).json({ error: 'Failed to fetch skill categories' });
  }
});

// Get tests pending evaluation
apiRouter.get('/tests/pending-evaluation', async (req: Request, res: Response) => {
  try {
    console.log('🔍 Fetching tests that require evaluation');
    
    const pendingTests = await TestResultModel.find({
      requiresEvaluation: true,
      evaluationStatus: 'pending'
    }).sort({ completedAt: -1 }); // Newest first
    
    console.log(`✅ Found ${pendingTests.length} tests pending evaluation`);
    
    // Get additional user and skill information
    const testsWithDetails = await Promise.all(pendingTests.map(async (test) => {
      let userInfo = null;
      let skillInfo = null;
      
      try {
        const userResponse = await UserModel.findOne({ clerkId: test.userId });
        if (userResponse) {
          userInfo = {
            name: `${userResponse.firstName || ''} ${userResponse.lastName || ''}`.trim(),
            email: userResponse.email
          };
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
      
      try {
        const skillResponse = await SkillTestModel.findOne({ skillId: test.skillId });
        if (skillResponse) {
          skillInfo = {
            name: skillResponse.name,
            category: skillResponse.category
          };
        }
      } catch (error) {
        console.error('Error fetching skill info:', error);
      }
      
      return {
        ...test.toObject(),
        user: userInfo,
        skill: skillInfo
      };
    }));
    
    res.json(testsWithDetails);
  } catch (error: any) {
    console.error('❌ Error fetching pending evaluations:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get a specific test result for evaluation
apiRouter.get('/tests/evaluation/:testId', async (req: Request, res: Response) => {
  try {
    console.log(`🔍 Fetching test result for evaluation: ${req.params.testId}`);
    
    const testResult = await TestResultModel.findById(req.params.testId);
    
    if (!testResult) {
      return res.status(404).json({ error: 'Test result not found' });
    }
    
    // Get test questions to provide context for evaluation
    const skillTest = await SkillTestModel.findOne({ skillId: testResult.skillId });
    
    // Get user information
    const user = await UserModel.findOne({ clerkId: testResult.userId });
    
    res.json({
      testResult,
      skillTest: skillTest || null,
      user: user ? {
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email
      } : null
    });
  } catch (error: any) {
    console.error('❌ Error fetching test for evaluation:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Submit test evaluation
apiRouter.post('/tests/evaluation/:testId', async (req: Request, res: Response) => {
  try {
    console.log(`🔍 Processing evaluation for test result: ${req.params.testId}`);
    console.log('Request body:', req.body);
    
    const { overallFeedback, practicalFeedback, practicalScores, evaluationStatus, passed } = req.body;
    
    const testResult = await TestResultModel.findById(req.params.testId);
    
    if (!testResult) {
      return res.status(404).json({ error: 'Test result not found' });
    }
    
    // Update practical submissions with feedback and scores
    // if (testResult.practicalSubmissions && practicalFeedback && practicalScores) {
    //   testResult.practicalSubmissions = testResult.practicalSubmissions.map((submission, index) => {
    //     if (practicalFeedback[submission.questionId]) {
    //       submission.feedback = practicalFeedback[submission.questionId];
    //       submission.score = practicalScores[submission.questionId] || 0;
    //       submission.status = 'evaluated';
    //       submission.evaluatedAt = new Date();
    //     }
    //     return submission;
    //   });
    // }
    
    // Update overall test result
    testResult.evaluatorFeedback = overallFeedback || null;
    testResult.evaluationStatus = evaluationStatus || 'completed';
    testResult.evaluatedAt = new Date();
    
    // Recalculate score if practical submissions were evaluated
    if (practicalScores && Object.keys(practicalScores).length > 0) {
      let totalScore = 0;
      let totalPossible = 0;
      
      // Calculate score from MCQ answers
      const mcqAnswers = Array.isArray(testResult.answers) ? testResult.answers : [];
      const mcqCorrect = mcqAnswers.filter(a => a && typeof a === 'object' && 'correct' in a && a.correct).length;
      const mcqTotal = mcqAnswers.length;
      totalScore += mcqCorrect;
      totalPossible += mcqTotal;
      
      // Add practical scores
      Object.values(practicalScores).forEach(score => {
        totalScore += Number(score) || 0;
        totalPossible += 10; // Assuming practical questions are out of 10
      });
      
      // Calculate percentage score
      const percentageScore = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
      
      testResult.score = percentageScore;
      testResult.passed = passed !== undefined ? passed : percentageScore >= 70; // Pass threshold 70%
    }
    
    await testResult.save();
    
    // Notify user that their test has been evaluated (could implement email notification here)
    
    res.json({
      success: true,
      message: 'Test evaluation submitted successfully',
      testResult
    });
  } catch (error: any) {
    console.error('❌ Error submitting test evaluation:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Test history check endpoint
apiRouter.get('/tests/check/:testId/:userId', async (req: Request, res: Response) => {
  try {
    console.log(`🔍 Checking if user ${req.params.userId} has taken test ${req.params.testId}`);
    
    // Find test results for this user and test
    const testResult = await TestResultModel.findOne({
      userId: req.params.userId,
      skillId: req.params.testId
    });
    
    if (testResult) {
      console.log(`✅ Found existing test result: User has already taken test ${req.params.testId}`);
      return res.json({
        hasAttempted: true,
        completedAt: testResult.completedAt,
        score: testResult.score,
        passed: testResult.passed
      });
    }
    
    console.log(`✅ No test result found: User has not taken test ${req.params.testId} yet`);
    return res.json({
      hasAttempted: false
    });
  } catch (error: any) {
    console.error('❌ Error checking test history:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// API Routes
apiRouter.get('/users/:clerkId', async (req: Request, res: Response) => {
  try {
    await mongoose.connection.asPromise();
    console.log('Fetching user with clerkId:', req.params.clerkId);
    
    let user = await UserModel.findOne({ clerkId: req.params.clerkId });
    
    if (!user) {
      const clerkUser = await fetch(`https://api.clerk.dev/v1/users/${req.params.clerkId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`
        }
      }).then(res => res.json());
      
      if (clerkUser.email_addresses?.[0]?.email_address) {
        user = await UserModel.findOne({ email: clerkUser.email_addresses[0].email_address });
      }
    }

    console.log('Found user:', user ? {
      email: user.email,
      certifications: user.certifications,
      skills: user.skills
    } : 'No user found');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      skills: user.skills || [],
      certifications: user.certifications || []
    });
  } catch (error: any) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

apiRouter.get('/tests/:testId', async (req: Request, res: Response) => {
  try {
    console.log(`🔍 Fetching test with ID: ${req.params.testId}`);
    
    // Ensure MongoDB connection is established
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB not connected, attempting to connect...');
      await mongoose.connection.asPromise();
      console.log('✅ MongoDB connected successfully');
    }
    
    // Check if the testId is a valid ObjectId
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.testId);
    
    // Build query based on whether testId is a valid ObjectId
    const query = isObjectId 
      ? {
          $or: [
            { skillId: req.params.testId },
            { _id: new mongoose.Types.ObjectId(req.params.testId) }
          ]
        }
      : { skillId: req.params.testId };
    
    console.log('🔍 Query:', JSON.stringify(query));
    
    // Try to find the test
    const test = await SkillTestModel.findOne(query);
    
    if (!test) {
      console.log(`❌ Test not found with ID: ${req.params.testId}`);
      return res.status(404).json({ error: 'Test not found' });
    }
    
    console.log(`✅ Test found: ${test.name}`);
    res.json(test);
  } catch (error) {
    console.error('❌ Error fetching test:', error);
    res.status(500).json({ error: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Submission timeout (10 seconds)
const SUBMISSION_TIMEOUT = 10000;

// Define the test submission handler without using Multer
app.post('/api/tests/submit', async (req: Request, res: Response) => {
  console.log('Test submission request received with content type:', req.headers['content-type']);
  
  // Handle JSON content type directly
  if (req.headers['content-type']?.includes('application/json')) {
    try {
      // Parse JSON if it's not already parsed
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      console.log('Processing JSON submission:', Object.keys(data));
      
      // Validate required fields
      if (!data.skillId || !data.userId || data.score === undefined) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Required fields: skillId, userId, score'
        });
      }
      
      // Handle potential screen recording
      let screenRecordingUrl = null;
      
      // First check for direct screenRecording field
      if (data.screenRecording) {
        try {
          console.log('Found screenRecording in JSON payload, processing...');
          console.log('Screen recording type:', typeof data.screenRecording);
          console.log('Screen recording structure:', JSON.stringify(data.screenRecording, (key, value) => {
            // Prevent circular references and handle binary data
            if (typeof value === 'object' && value !== null) {
              if (key === 'data' && value.length > 100) {
                return `[Binary data of length ${value.length}]`;
              }
            }
            return value;
          }).substring(0, 200) + '...');
          
          let base64Data = '';
          let buffer = null;
          
          // Handle different formats of screen recording data
          if (typeof data.screenRecording === 'string') {
            // Handle as string (likely base64)
            console.log('Processing screen recording as string');
            base64Data = data.screenRecording;
            
            // Extract base64 content if it's a data URL
            if (base64Data.includes('base64,')) {
              base64Data = base64Data.split('base64,')[1];
            }
          } else if (typeof data.screenRecording === 'object') {
            console.log('Processing screen recording as object');
            console.log('Screen recording object keys:', Object.keys(data.screenRecording));
            
            // Case 1: Check for direct blob/file object (common for React/browser submissions)
            if (data.screenRecording.type && data.screenRecording.size) {
              console.log('Detected File/Blob-like object:', {
                type: data.screenRecording.type,
                size: data.screenRecording.size
              });
              
              // Look for base64 representation that might have been added by frontend
              if (data.screenRecording.base64) {
                console.log('Found base64 property in File object');
                base64Data = data.screenRecording.base64;
                if (base64Data.includes('base64,')) {
                  base64Data = base64Data.split('base64,')[1];
                }
              } else if (data.screenRecording.data) {
                console.log('Found data property in File object type:', typeof data.screenRecording.data);
                
                if (typeof data.screenRecording.data === 'string') {
                  // String data
                  base64Data = data.screenRecording.data;
                  if (base64Data.includes('base64,')) {
                    base64Data = base64Data.split('base64,')[1];
                  }
                } else if (Array.isArray(data.screenRecording.data) || 
                           Buffer.isBuffer(data.screenRecording.data) ||
                           (typeof data.screenRecording.data === 'object' && data.screenRecording.data !== null)) {
                  // Array-like or Buffer-like
                  try {
                    console.log('Attempting to process binary data');
                    if (Buffer.isBuffer(data.screenRecording.data)) {
                      buffer = data.screenRecording.data;
                    } else if (Array.isArray(data.screenRecording.data)) {
                      buffer = Buffer.from(data.screenRecording.data);
                    } else {
                      // Last resort - try to get data from the object
                      const jsonStr = JSON.stringify(data.screenRecording.data);
                      console.log('Converting complex object to string:', jsonStr.substring(0, 100) + '...');
                      buffer = Buffer.from(jsonStr);
                    }
                    console.log(`Created buffer of size: ${buffer.length} bytes`);
                  } catch (bufferError) {
                    console.error('Error processing binary data:', bufferError);
                  }
                }
              }
            }
            // Case 2: Object with data property
            else if (data.screenRecording.data) {
              console.log('Processing object with data property, type:', typeof data.screenRecording.data);
              
              if (typeof data.screenRecording.data === 'string') {
                // String data
                base64Data = data.screenRecording.data;
                if (base64Data.includes('base64,')) {
                  base64Data = base64Data.split('base64,')[1];
                }
              } else if (Array.isArray(data.screenRecording.data)) {
                // Array buffer
                console.log('Data is array of length:', data.screenRecording.data.length);
                buffer = Buffer.from(data.screenRecording.data);
              } else if (typeof data.screenRecording.data === 'object' && data.screenRecording.data !== null) {
                // Some other object structure
                console.log('Data is complex object with keys:', Object.keys(data.screenRecording.data));
                try {
                  const jsonStr = JSON.stringify(data.screenRecording.data);
                  console.log('Converting complex object to string:', jsonStr.substring(0, 100) + '...');
                  buffer = Buffer.from(jsonStr);
                } catch (jsonError) {
                  console.error('Error stringifying data object:', jsonError);
                }
              }
            }
            // Case 3: Plain object that might be a serialized recording
            else {
              console.log('Processing as plain object, attempting to stringify');
              try {
                const jsonStr = JSON.stringify(data.screenRecording);
                console.log('Converting plain object to string:', jsonStr.substring(0, 100) + '...');
                buffer = Buffer.from(jsonStr);
              } catch (jsonError) {
                console.error('Error stringifying recording object:', jsonError);
              }
            }
          }
          
          // Process based on what we found
          if (base64Data) {
            // Process base64 string
            console.log('Processing base64 data of length:', base64Data.length);
            try {
              buffer = Buffer.from(base64Data, 'base64');
              console.log(`Screen recording base64 size: ${(buffer.length / (1024 * 1024)).toFixed(2)} MB`);
            } catch (base64Error) {
              console.error('Error converting base64 to buffer:', base64Error);
            }
          }
          
          // If we have a buffer from any source, upload it
          if (buffer && buffer.length > 0) {
            console.log(`Uploading buffer to Cloudinary, size: ${(buffer.length / (1024 * 1024)).toFixed(2)} MB`);
            
            const recordingMetadata = {
              userId: data.userId,
              skillId: data.skillId,
              email: data.email || 'unknown',
              testDate: new Date().toISOString(),
              source: 'screenRecording-json'
            };
            
            try {
              screenRecordingUrl = await uploadToCloudinary(
                buffer,
                'test-recordings',
                recordingMetadata,
                {
                  filename: `recording-${Date.now()}.webm`,
                  mimetype: data.screenRecording && data.screenRecording.type ? data.screenRecording.type : 'video/webm'
                }
              );
              
              console.log('Screen recording uploaded successfully to Cloudinary:', screenRecordingUrl);
            } catch (uploadError) {
              console.error('Error uploading to Cloudinary:', uploadError);
            }
          } else {
            console.warn('No valid buffer created from screen recording data');
          }
        } catch (error) {
          console.error('Failed to process screen recording from JSON:', error);
          console.error('Screen recording data type:', typeof data.screenRecording);
          if (typeof data.screenRecording === 'object') {
            console.error('Screen recording keys:', Object.keys(data.screenRecording));
          }
        }
      }
      
      // Fallback to screenRecordingBase64 if no URL yet
      if (!screenRecordingUrl && data.screenRecordingBase64) {
        try {
          console.log('Found base64 screen recording in JSON payload, processing...');
          let base64Data = data.screenRecordingBase64;
          
          if (base64Data.includes('base64,')) {
            base64Data = base64Data.split('base64,')[1];
          }
          
          const buffer = Buffer.from(base64Data, 'base64');
          console.log(`Base64 screen recording size: ${(buffer.length / (1024 * 1024)).toFixed(2)} MB`);
          
          const recordingMetadata = {
            userId: data.userId,
            skillId: data.skillId,
            email: data.email || 'unknown',
            testDate: new Date().toISOString(),
            source: 'base64-json'
          };
          
          screenRecordingUrl = await uploadToCloudinary(
            buffer,
            'test-recordings',
            recordingMetadata,
            {
              filename: `recording-${Date.now()}.webm`,
              mimetype: 'video/webm'
            }
          );
          
          console.log('Base64 screen recording uploaded successfully:', screenRecordingUrl);
        } catch (error) {
          console.error('Failed to process base64 screen recording from JSON:', error);
        }
      }
      
      // Fetch the user's email if not provided
      let userEmail = data.email;
      if (!userEmail) {
        try {
          const user = await UserModel.findOne({ clerkId: data.userId });
          if (user && user.email) {
            userEmail = user.email;
          }
        } catch (error) {
          console.error('Error fetching user email:', error);
        }
      }
      
      // Handle category
      let testCategory = data.category;
      if (!testCategory) {
        // Determine category based on test
        const test = await SkillTestModel.findOne({ skillId: data.skillId });
        if (test && test.category) {
          testCategory = test.category;
        } else {
          // Default categorization
          if (data.skillId.includes('web') || data.skillId.includes('react')) {
            testCategory = 'Web Development';
          } else if (data.skillId.includes('python')) {
            testCategory = 'Programming';
          } else {
            testCategory = 'General';
          }
        }
      }
      
      // Create test result
      const result = await TestResultModel.create({
        skillId: data.skillId,
        userId: data.userId,
        score: typeof data.score === 'string' ? parseFloat(data.score) : data.score,
        passed: data.passed === true || data.passed === 'true',
        answers: Array.isArray(data.answers) ? data.answers : [],
        practicalSubmissions: Array.isArray(data.practicalSubmissions) ? data.practicalSubmissions : [],
        requiresEvaluation: data.requiresEvaluation === true || data.requiresEvaluation === 'true',
        email: userEmail,
        category: testCategory,
        screenRecording: screenRecordingUrl,
        evaluationStatus: (data.requiresEvaluation === true || data.requiresEvaluation === 'true') ? 'pending' : 'completed',
        completedAt: new Date()
      });
      
      console.log('Test result saved successfully from JSON submission');
      
      return res.status(200).json({
        message: 'Test result recorded successfully',
        result
      });
      
    } catch (error: any) {
      console.error('Error processing JSON test submission:', error);
      return res.status(500).json({
        error: 'Server Error',
        details: error.message
      });
    }
  } 
  // Handle multipart/form-data with multer
  else if (req.headers['content-type']?.includes('multipart/form-data')) {
    console.log('Processing multipart/form-data submission with multer');
    
    // Use multer for more reliable multipart/form-data handling
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: { 
        fileSize: 100 * 1024 * 1024 // 100 MB
      }
    }).single('screenRecording');
    
    // Process the upload
    upload(req, res, async (err) => {
      if (err) {
        console.error('Multer error processing upload:', err);
        return res.status(500).json({
          error: 'Upload Error',
          details: err.message
        });
      }
      
      try {
        console.log('Multer successfully processed the upload');
        
        // Create data object from form fields
        const formData = req.body;
        console.log('Form data fields:', Object.keys(formData));
        
        // Validate required fields
        if (!formData.skillId || !formData.userId || formData.score === undefined) {
          return res.status(400).json({
            error: 'Missing required fields',
            message: 'Required fields: skillId, userId, score'
          });
        }
        
        // Handle screen recording file if available
        let screenRecordingUrl = null;
        if (req.file) {
          try {
            console.log('Screen recording file details:', {
              originalname: req.file.originalname,
              mimetype: req.file.mimetype,
              size: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`
            });
            
            // Define metadata for the upload
            const recordingMetadata = {
              userId: formData.userId,
              skillId: formData.skillId,
              email: formData.email || 'unknown',
              testDate: new Date().toISOString()
            };
            
            // Upload directly to Cloudinary from buffer
            screenRecordingUrl = await uploadToCloudinary(
              req.file.buffer,
              'test-recordings',
              recordingMetadata,
              {
                filename: req.file.originalname,
                mimetype: req.file.mimetype
              }
            );
            
            console.log('Screen recording uploaded successfully to Cloudinary:', screenRecordingUrl);
          } catch (error) {
            console.error('Failed to upload screen recording to Cloudinary:', error);
          }
        } 
        // Check for base64 encoded screen recording as fallback
        else if (formData.screenRecordingBase64) {
          try {
            console.log('Processing base64 screen recording...');
            let base64Data = formData.screenRecordingBase64;
            
            // Extract base64 content if it's a data URL
            if (base64Data.includes('base64,')) {
              base64Data = base64Data.split('base64,')[1];
            }
            
            // Convert to buffer
            const buffer = Buffer.from(base64Data, 'base64');
            console.log(`Base64 screen recording size: ${(buffer.length / (1024 * 1024)).toFixed(2)} MB`);
            
            // Upload to Cloudinary
            const recordingMetadata = {
              userId: formData.userId,
              skillId: formData.skillId,
              email: formData.email || 'unknown',
              testDate: new Date().toISOString(),
              source: 'base64-conversion'
            };
            
            screenRecordingUrl = await uploadToCloudinary(
              buffer,
              'test-recordings',
              recordingMetadata,
              {
                filename: `recording-${Date.now()}.webm`,
                mimetype: 'video/webm'
              }
            );
            
            console.log('Base64 screen recording uploaded successfully:', screenRecordingUrl);
          } catch (error) {
            console.error('Failed to process base64 screen recording:', error);
          }
        } else {
          console.log('No screen recording found in request');
        }
        
        // Parse data for MongoDB
        const parsedData = {
          skillId: formData.skillId,
          userId: formData.userId,
          score: parseFloat(formData.score),
          passed: formData.passed === 'true',
          answers: JSON.parse(formData.answers || '[]'),
          practicalSubmissions: JSON.parse(formData.practicalSubmissions || '[]'),
          requiresEvaluation: formData.requiresEvaluation === 'true'
        };
        
        // Get user email if not provided
        let userEmail = formData.email;
        if (!userEmail) {
          try {
            const user = await UserModel.findOne({ clerkId: parsedData.userId });
            if (user && user.email) {
              userEmail = user.email;
            }
          } catch (error) {
            console.error('Error fetching user email:', error);
          }
        }
        
        // Handle category
        let testCategory = formData.category;
        if (!testCategory) {
          // Try to determine category based on test
          const test = await SkillTestModel.findOne({ skillId: parsedData.skillId });
          if (test && test.category) {
            testCategory = test.category;
          } else {
            // Default categorization
            if (parsedData.skillId.includes('web') || parsedData.skillId.includes('react')) {
              testCategory = 'Web Development';
            } else if (parsedData.skillId.includes('python')) {
              testCategory = 'Programming';
            } else {
              testCategory = 'General';
            }
          }
        }
        
        // Create test result
        const result = await TestResultModel.create({
          ...parsedData,
          email: userEmail,
          category: testCategory,
          screenRecording: screenRecordingUrl,
          evaluationStatus: parsedData.requiresEvaluation ? 'pending' : 'completed',
          completedAt: new Date()
        });
        
        console.log('Test result saved successfully:', {
          userId: parsedData.userId,
          skillId: parsedData.skillId,
          hasScreenRecording: !!screenRecordingUrl
        });
        
        // Update test with category if needed
        if (!testCategory) {
          const test = await SkillTestModel.findOne({ skillId: parsedData.skillId });
          if (test && !test.category) {
            test.category = testCategory;
            await test.save();
          }
        }
        
        // Send success response
        res.status(200).json({
          message: 'Test result recorded successfully',
          result
        });
        
      } catch (error: any) {
        console.error('Error processing test submission:', error);
        res.status(500).json({
          error: 'Server Error',
          details: error.message
        });
      }
    });
  }
  // Handle unsupported content types
  else {
    console.error('Unsupported content type:', req.headers['content-type']);
    res.status(400).json({
      error: 'Unsupported content type',
      message: `Content type must be multipart/form-data or application/json, but got: ${req.headers['content-type']}`,
      acceptedTypes: ['multipart/form-data', 'application/json']
    });
  }
});

// Original endpoint for backward compatibility
app.post('/api/tests/testresults', (req: Request, res: Response) => {
  console.log('Test result received on legacy endpoint, forwarding to new endpoint');
  // Forward the request to the submit endpoint
  req.url = '/api/tests/submit';
  app._router.handle(req, res);
});

// Simple endpoint to check if a user has already taken a specific test
// Register it on the main app object for direct access
app.get('/api/tests/check/:testId/:userId', async (req: Request, res: Response) => {
  try {
    const { userId, testId } = req.params;
    
    if (!userId || !testId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    console.log(`🔍 Checking if user ${userId} has already taken test ${testId}`);
    
    // Just check if there's any result for this user and this test/skill ID
    const existingResult = await TestResultModel.findOne({ userId, skillId: testId });
    
    if (existingResult) {
      console.log(`✅ Found existing test result for user ${userId} and test ${testId}`);
      return res.status(200).json({
        hasAttempted: true,
        completedAt: existingResult.completedAt || new Date()
      });
    }
    
    console.log(`✅ No existing test result found for user ${userId} and test ${testId}`);
    return res.status(200).json({ hasAttempted: false });
  } catch (error: any) {
    console.error('❌ Error checking test history:', error);
    res.status(500).json({ 
      error: 'Server Error',
      details: error.message
    });
  }
});

// Keep the existing check endpoint for backward compatibility
app.get('/api/tests/testresults/check', async (req: Request, res: Response) => {
  try {
    const { userId, testId } = req.query;
    
    if (!userId || !testId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Redirect to the new endpoint structure
    return res.redirect(`/api/tests/check/${testId}/${userId}`);
  } catch (error: any) {
    console.error('❌ Error in redirect:', error);
    res.status(500).json({ 
      error: 'Server Error',
      details: error.message
    });
  }
});

apiRouter.post('/users/skills', async (req: Request, res: Response) => {
  try {
    await mongoose.connection.asPromise();
    const { userId, skillId, score, passedAt } = req.body;

    if (!userId || !skillId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await UserModel.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const test = await SkillTestModel.findOne({ skillId });
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Determine category based on test name or skillId
    let category = test.category;
    if (!category) {
      if (skillId.includes('web') || skillId.includes('react') || skillId.includes('js') || 
          skillId.includes('html') || skillId.includes('css')) {
        category = 'Web Development';
      } else if (skillId.includes('python')) {
        category = 'Programming';
      } else if (skillId.includes('sql')) {
        category = 'Database';
      } else {
        category = 'General';
      }
      
      // Update the test with the determined category
      test.category = category;
      await test.save();
    }

    if (!user.skills.includes(skillId)) {
      user.skills.push(skillId);
    }

    user.certifications.push({
      skillId,
      name: test.name,
      category: category,
      issuedAt: new Date(passedAt),
      score
    });

    await user.save();

    res.status(200).json({ 
      message: 'User skills updated successfully',
      user: {
        skills: user.skills,
        certifications: user.certifications
      }
    });
  } catch (error: any) {
    console.error('❌ Error updating user skills:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

apiRouter.get('/freelancers/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const freelancer = await Freelancer.findOne({ userId });
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    return res.status(200).json({
      id: freelancer._id,
      userId: freelancer.userId,
      isVerified: freelancer.isVerified,
      title: freelancer.title,
      rating: freelancer.rating,
      totalReviews: freelancer.totalReviews,
      completedProjects: freelancer.completedProjects
    });
  } catch (error) {
    console.error('Error fetching freelancer:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

apiRouter.post('/freelancers/register', upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'certifications.*.certificateFile', maxCount: 10 }
]), async (req: Request, res: Response) => {
  try {
    const { userId, email, ...profileData } = req.body;
    const files = req.files as MulterFiles;

    console.log('Freelancer registration attempt for email:', email);
    console.log('Profile data:', profileData);

    const existingFreelancer = await Freelancer.findOne({ userId });
    if (existingFreelancer) {
      return res.status(400).json({ error: 'User is already registered as a freelancer' });
    }

    // Find user by email instead of clerkId
    const user = await UserModel.findOne({ email });
    console.log('Found user by email:', user ? {
      email: user.email,
      certifications: user.certifications,
      skills: user.skills
    } : 'No user found');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has any certifications
    if (!user.certifications || user.certifications.length === 0) {
      console.log('User has no certifications:', user);
      return res.status(400).json({ 
        error: 'Please complete at least one skill assessment before registering as a freelancer' 
      });
    }

    // Check if user has passed at least one test in any category
    const hasPassedTest = user.certifications.some(cert => cert.score >= 70);
    if (!hasPassedTest) {
      return res.status(400).json({
        error: 'You need to pass at least one skill assessment before registering as a freelancer'
      });
    }

    // Process certifications with file paths
    let certifications = [];
    if (profileData.certifications) {
      certifications = JSON.parse(profileData.certifications).map((cert: any, index: number) => {
        const certFile = files[`certifications.${index}.certificateFile`]?.[0];
        return {
          ...cert,
          certificateFile: certFile ? `/uploads/${path.basename(certFile.path)}` : null
        };
      });
    }

    // Create freelancer object with required fields
    const freelancerData = {
      userId,
      email: user.email,
      title: profileData.title,
      bio: profileData.bio,
      languages: JSON.parse(profileData.languages || '[]'),
      location: profileData.location,
      availability: profileData.availability,
      skills: profileData.skills ? profileData.skills.split(',').map((s: string) => s.trim()) : [],
      experience: profileData.experience || '',
      phone: profileData.phone || '',
      portfolio: profileData.portfolio || '',
      github: profileData.github || '',
      linkedin: profileData.linkedin || '',
      website: profileData.website || '',
      certifications,
      profilePicture: files['profilePicture']?.[0] ? `/uploads/${path.basename(files['profilePicture'][0].path)}` : null,
    };

    console.log('Creating freelancer with data:', freelancerData);

    const freelancer = new Freelancer(freelancerData);
    await freelancer.save();
    
    console.log('Freelancer profile created successfully');

    res.status(201).json({
      message: 'Freelancer profile created successfully',
      freelancer
    });
  } catch (error: any) {
    console.error('Error creating freelancer profile:', error);
    res.status(500).json({
      error: 'Failed to create freelancer profile',
      details: error.message
    });
  }
});

// Add gig creation endpoint
apiRouter.post('/gigs/create', upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'video', maxCount: 1 },
  { name: 'documents', maxCount: 3 }
]), async (req: Request, res: Response) => {
  try {
    console.log('Received gig creation request');
    console.log('Request body:', req.body);
    console.log('Files:', req.files);

    const {
      freelancerId,
      userEmail,
      title,
      category,
      description,
      deliveryTime,
      packages,
      extraFastDelivery,
      faqs,
      requirements,
      searchTags,
      requiredSkills
    } = req.body;

    // Validate required fields
    if (!freelancerId || !userEmail || !title || !category || !description) {
      console.log('Missing required fields:', { freelancerId, userEmail, title, category, description });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if freelancer exists
    const freelancer = await Freelancer.findOne({ userId: freelancerId });
    if (!freelancer) {
      console.log('Freelancer not found:', freelancerId);
      return res.status(404).json({ error: 'Freelancer not found' });
    }

    // Process uploaded files with Cloudinary
    const files = req.files as MulterFiles;
    
    // Upload images to Cloudinary
    let images: string[] = [];
    if (files?.['images']?.length) {
      try {
        console.log('Processing images:', files['images'].map(f => ({
          filename: f.filename,
          path: f.path,
          size: f.size
        })));

        // Upload each image to Cloudinary
        const uploadPromises = files['images'].map(async file => {
          try {
            const url = await uploadToCloudinary(file.path, 'gigs/images');
            console.log('Successfully uploaded image:', { path: file.path, url });
            return url;
          } catch (error) {
            console.error('Failed to upload image:', { path: file.path, error });
            throw error;
          }
        });

        images = await Promise.all(uploadPromises);
        
        // Clean up temporary files
        files['images'].forEach(file => {
          try {
            fs.unlinkSync(file.path);
            console.log('Cleaned up temporary file:', file.path);
          } catch (err) {
            console.error('Error deleting temporary file:', { path: file.path, error: err });
          }
        });
      } catch (uploadError: any) {
        console.error('Error uploading images to Cloudinary:', uploadError);
        return res.status(500).json({ 
          error: 'Failed to upload images',
          details: uploadError.message 
        });
      }
    }
    
    // Upload video to Cloudinary
    let video: string | undefined = undefined;
    if (files?.['video']?.[0]) {
      try {
        console.log('Processing video:', {
          filename: files['video'][0].filename,
          path: files['video'][0].path,
          size: files['video'][0].size
        });

        video = await uploadToCloudinary(files['video'][0].path, 'gigs/videos');
        console.log('Successfully uploaded video:', { path: files['video'][0].path, url: video });
        
        // Clean up temporary file
        fs.unlinkSync(files['video'][0].path);
        console.log('Cleaned up temporary video file:', files['video'][0].path);
      } catch (uploadError) {
        console.error('Error uploading video to Cloudinary:', uploadError);
        // Don't fail the entire request if video upload fails
      }
    }
    
    // Upload documents to Cloudinary
    let documents: string[] = [];
    if (files?.['documents']?.length) {
      try {
        console.log('Processing documents:', files['documents'].map(f => ({
          filename: f.filename,
          path: f.path,
          size: f.size
        })));

        const uploadPromises = files['documents'].map(async file => {
          try {
            const url = await uploadToCloudinary(file.path, 'gigs/documents');
            console.log('Successfully uploaded document:', { path: file.path, url });
            return url;
          } catch (error) {
            console.error('Failed to upload document:', { path: file.path, error });
            throw error;
          }
        });

        documents = await Promise.all(uploadPromises);
        
        // Clean up temporary files
        files['documents'].forEach(file => {
          try {
            fs.unlinkSync(file.path);
            console.log('Cleaned up temporary document file:', file.path);
          } catch (err) {
            console.error('Error deleting temporary file:', { path: file.path, error: err });
          }
        });
      } catch (uploadError) {
        console.error('Error uploading documents to Cloudinary:', uploadError);
        // Don't fail the entire request if document upload fails
      }
    }

    console.log('Creating gig with data:', {
      freelancerId: freelancer._id,
      userEmail,
      title,
      category,
      imageCount: images.length,
      hasVideo: !!video,
      documentCount: documents.length
    });

    // Create new gig
    const parsedPackages = JSON.parse(packages);
    const formattedPackages: GigPackage[] = Array.isArray(parsedPackages) ? parsedPackages.map(pkg => ({
      name: pkg.name || 'Basic Package',
      description: pkg.description || 'Standard service offering',
      deliveryTime: parseInt(pkg.deliveryTime) || 3,
      revisions: parseInt(pkg.revisions) || 1,
      price: parseFloat(pkg.price) || 5,
      features: Array.isArray(pkg.features) ? pkg.features : []
    })) : [{
      name: 'Basic Package',
      description: 'Standard service offering',
      deliveryTime: 3,
      revisions: 1,
      price: 5,
      features: []
    }];

    const gig = new Gig({
      freelancerId: freelancer._id,
      userEmail,
      title,
      category,
      description,
      deliveryTime: parseInt(deliveryTime),
      packages: formattedPackages,
      extraFastDelivery: JSON.parse(extraFastDelivery),
      faqs: JSON.parse(faqs),
      requirements: JSON.parse(requirements),
      searchTags: JSON.parse(searchTags),
      requiredSkills: JSON.parse(requiredSkills),
      images,
      video,
      documents,
      status: 'active'
    });

    await gig.save();
    console.log('Gig created successfully:', gig._id);
    res.status(201).json(gig);
  } catch (error: any) {
    console.error('Error creating gig:', error);
    res.status(500).json({ 
      error: 'Failed to create gig',
      details: error.message 
    });
  }
});

// Get user's gigs
apiRouter.get('/gigs/user/:userId', async (req: Request, res: Response) => {
  try {
    // Find the freelancer document first
    const freelancer = await Freelancer.findOne({ userId: req.params.userId });
    if (!freelancer) {
      console.log('Freelancer not found:', req.params.userId);
      return res.status(404).json({ error: 'Freelancer not found' });
    }

    // Find gigs by either freelancerId as ObjectId or as string (for backward compatibility)
    const gigs = await Gig.find({
      $or: [
        { freelancerId: freelancer._id },
        { freelancerId: req.params.userId }
      ]
    }).sort({ createdAt: -1 });

    // Format image URLs with the server's base URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const formattedGigs = gigs.map(gig => ({
      ...gig.toObject(),
      images: gig.images.map(image => {
        // Handle both local paths and URLs
        if (image.startsWith('http')) return image;
        if (image.startsWith('C:\\') || image.startsWith('/')) {
          // For local paths, just return the filename
          const parts = image.split(/[\\/]/);
          return `${baseUrl}/uploads/${parts[parts.length - 1]}`;
        }
        return `${baseUrl}${image}`;
      }),
      video: gig.video ? (gig.video.startsWith('http') ? gig.video : `${baseUrl}${gig.video}`) : undefined,
      documents: gig.documents.map(doc => {
        if (doc.startsWith('http')) return doc;
        if (doc.startsWith('C:\\') || doc.startsWith('/')) {
          const parts = doc.split(/[\\/]/);
          return `${baseUrl}/uploads/${parts[parts.length - 1]}`;
        }
        return `${baseUrl}${doc}`;
      })
    }));

    res.json(formattedGigs);
  } catch (error) {
    console.error('Error fetching user gigs:', error);
    res.status(500).json({ error: 'Failed to fetch gigs' });
  }
});

// Get all gigs (for explore page)
apiRouter.get('/gigs', async (req: Request, res: Response) => {
  try {
    console.log('🔍 GET /api/gigs - Request received');
    console.log('Query parameters:', req.query);
    
    const { category, search, sort = 'newest' } = req.query;
    let query: any = { status: 'active' };

    // Apply filters
    if (category && category !== 'all') {
      query.category = { $regex: category, $options: 'i' };
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { searchTags: { $regex: search, $options: 'i' } }
      ];
    }

    // Advanced filters
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    if (minPrice !== undefined || maxPrice !== undefined) {
      query['packages.0.price'] = {};
      if (minPrice !== undefined) query['packages.0.price'].$gte = minPrice;
      if (maxPrice !== undefined) query['packages.0.price'].$lte = maxPrice;
    }
    const deliveryTime = req.query.deliveryTime ? Number(req.query.deliveryTime) : undefined;
    if (deliveryTime !== undefined) {
      query['packages.0.deliveryTime'] = { $lte: deliveryTime };
    }

    // Apply sorting
    let sortOption = {};
    switch (sort) {
      case 'price_low':
        sortOption = { 'packages.0.price': 1 };
        break;
      case 'price_high':
        sortOption = { 'packages.0.price': -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
    }

    console.log('Final query:', JSON.stringify(query, null, 2));
    console.log('Sort option:', sortOption);

    // Get all gigs
    let gigs = await Gig.find(query)
      .sort(sortOption)
      .lean();

    // Get unique emails from gigs
    const uniqueEmails = [...new Set(gigs.map(gig => gig.userEmail))];

    // Fetch all relevant freelancers in one query
    const freelancers = await Freelancer.find({ email: { $in: uniqueEmails } })
      .select('email title rating totalReviews profilePicture')
      .lean();

    // Filter by minRating (since rating is on freelancer)
    const minRating = req.query.minRating ? Number(req.query.minRating) : undefined;
    if (minRating !== undefined) {
      const allowedEmails = freelancers.filter(f => (f.rating || 0) >= minRating).map(f => f.email);
      gigs = gigs.filter(gig => allowedEmails.includes(gig.userEmail));
    }

    // Create a map of freelancer data by email for quick lookup
    const freelancerMap = new Map(
      freelancers.map(f => [f.email, f])
    );

    // Format the response
    const formattedGigs = gigs.map(gig => {
      // Get the freelancer data from our map using email
      const freelancer = freelancerMap.get(gig.userEmail) || {
        title: 'Unknown Freelancer',
        rating: 0,
        totalReviews: 0,
        profilePicture: null
      };

      // Format image URLs
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const formattedImages = gig.images.map(image => 
        image.startsWith('http') ? image : `${baseUrl}${image}`
      );

      // Format video URL
      const formattedVideo = gig.video 
        ? (gig.video.startsWith('http') ? gig.video : `${baseUrl}${gig.video}`)
        : undefined;

      // Ensure packages are properly formatted and have required fields
      let formattedPackages: GigPackage[] = [];
      if (gig.packages) {
        if (Array.isArray(gig.packages)) {
          // Handle array format
          formattedPackages = gig.packages.map(pkg => ({
            name: pkg.name || 'Basic Package',
            description: pkg.description || 'Standard service offering',
            deliveryTime: pkg.deliveryTime || 3,
            revisions: pkg.revisions || 1,
            price: pkg.price || 5,
            features: pkg.features || []
          }));
        } else if (typeof gig.packages === 'object') {
          // Handle object format with basic/standard/premium
          const packageTypes = ['basic', 'standard', 'premium'];
          formattedPackages = packageTypes
            .filter(type => gig.packages[type])
            .map(type => ({
              name: gig.packages[type].name || `${type.charAt(0).toUpperCase() + type.slice(1)} Package`,
              description: gig.packages[type].description || 'Standard service offering',
              deliveryTime: gig.packages[type].deliveryTime || 3,
              revisions: gig.packages[type].revisions || 1,
              price: gig.packages[type].price || 5,
              features: Array.isArray(gig.packages[type].features) ? 
                gig.packages[type].features : 
                Object.entries(gig.packages[type].features || {})
                  .filter(([_, value]) => value === true)
                  .map(([key]) => key)
            }));
        }
      }
      
      // If still no packages, create a default one
      if (formattedPackages.length === 0) {
        formattedPackages = [{
          name: 'Basic Package',
          description: 'Standard service offering',
          deliveryTime: 3,
          revisions: 1,
          price: 5,
          features: []
        }];
      }

      return {
        ...gig,
        images: formattedImages,
        video: formattedVideo,
        packages: formattedPackages,
        freelancerId: freelancer
      };
    });

    console.log(`✅ Returning ${formattedGigs.length} formatted gigs`);
    res.json(formattedGigs);
  } catch (error) {
    console.error('❌ Error fetching gigs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch gigs',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get individual gig details
apiRouter.get('/gigs/:gigId', async (req: Request, res: Response) => {
  try {
    const { gigId } = req.params;
    
    const gig = await Gig.findById(gigId).lean();
    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    // Get freelancer details
    const freelancer = await Freelancer.findOne({ email: gig.userEmail })
      .select('title rating totalReviews profilePicture location languages skills description completedProjects')
      .lean();

    if (!freelancer) {
      return res.status(404).json({ error: 'Freelancer not found' });
    }

    // Calculate additional freelancer metrics
    const memberSince = freelancer.createdAt 
      ? new Date(freelancer.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : 'Recently joined';

    // Get last delivery date from orders (you'll need to implement this based on your orders schema)
    const lastDelivery = 'About 2 hours ago'; // Placeholder - implement based on your orders system

    // Get response time (you'll need to implement this based on your messaging system)
    const responseTime = '1 Hour'; // Placeholder - implement based on your messaging system

    // Get order queue (active orders)
    const orderQueue = 3; // Placeholder - implement based on your orders system

    // Format image URLs
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const formattedImages = gig.images.map(image => 
      image.startsWith('http') ? image : `${baseUrl}${image}`
    );

    // Format video URL
    const formattedVideo = gig.video 
      ? (gig.video.startsWith('http') ? gig.video : `${baseUrl}${gig.video}`)
      : undefined;

    // Ensure packages are properly formatted
    let formattedPackages = [];
    if (gig.packages) {
      if (Array.isArray(gig.packages)) {
        formattedPackages = gig.packages;
      } else if (typeof gig.packages === 'object') {
        const packageTypes = ['basic', 'standard', 'premium'];
        formattedPackages = packageTypes
          .filter(type => gig.packages[type])
          .map(type => ({
            name: gig.packages[type].name,
            description: gig.packages[type].description,
            deliveryTime: gig.packages[type].deliveryTime,
            revisions: gig.packages[type].revisions,
            price: gig.packages[type].price,
            features: Array.isArray(gig.packages[type].features) ? 
              gig.packages[type].features : 
              Object.entries(gig.packages[type].features || {})
                .filter(([_, value]) => value === true)
                .map(([key]) => key)
          }));
      }
    }

    // Format freelancer profile picture
    const formattedProfilePicture = freelancer.profilePicture
      ? (freelancer.profilePicture.startsWith('http') 
        ? freelancer.profilePicture 
        : `${baseUrl}${freelancer.profilePicture}`)
      : null;

    res.json({
      ...gig,
      images: formattedImages,
      video: formattedVideo,
      packages: formattedPackages,
      freelancerId: {
        ...freelancer,
        profilePicture: formattedProfilePicture,
        memberSince,
        lastDelivery,
        responseTime,
        orderQueue,
        languages: freelancer.languages || ['English'],
        skills: freelancer.skills || [],
        description: freelancer.description || 'Professional freelancer with expertise in this field.'
      }
    });
  } catch (error) {
    console.error('Error fetching gig details:', error);
    res.status(500).json({ error: 'Failed to fetch gig details' });
  }
});

// Update gig status
apiRouter.patch('/gigs/:gigId/status', async (req: Request, res: Response) => {
  try {
    const { gigId } = req.params;
    const { status } = req.body;
    
    console.log('Received status update request:', { gigId, status });

    if (!['active', 'paused', 'deleted'].includes(status)) {
      console.log('Invalid status received:', status);
      return res.status(400).json({ error: 'Invalid status' });
    }

    console.log('Finding gig with ID:', gigId);
    const gig = await Gig.findByIdAndUpdate(
      gigId,
      { status },
      { new: true }
    );

    if (!gig) {
      console.log('Gig not found:', gigId);
      return res.status(404).json({ error: 'Gig not found' });
    }

    console.log('Successfully updated gig status:', gig);
    res.json(gig);
  } catch (error) {
    console.error('Error updating gig status:', error);
    res.status(500).json({ error: 'Failed to update gig status' });
  }
});

// Fix image paths for existing gigs (ADMIN ONLY)
apiRouter.post('/admin/fix-gig-images', async (req: Request, res: Response) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const gigs = await Gig.find({});
    let fixed = 0;
    
    for (const gig of gigs) {
      let hasChanges = false;
      
      // Fix image paths
      if (gig.images && gig.images.length > 0) {
        const newImages = gig.images.map(image => {
          // If image is a local file path (starts with C:\ or similar)
          if (image.match(/^[A-Z]:\\/) || image.includes('\\\\')) {
            hasChanges = true;
            // Extract just the filename
            const filename = path.basename(image);
            return `${baseUrl}/uploads/${filename}`;
          }
          return image;
        });
        
        if (hasChanges) {
          gig.images = newImages;
        }
      }
      
      // Fix video path
      if (gig.video && (gig.video.match(/^[A-Z]:\\/) || gig.video.includes('\\\\'))) {
        const filename = path.basename(gig.video);
        gig.video = `${baseUrl}/uploads/${filename}`;
        hasChanges = true;
      }
      
      // Fix document paths
      if (gig.documents && gig.documents.length > 0) {
        const newDocs = gig.documents.map(doc => {
          if (doc.match(/^[A-Z]:\\/) || doc.includes('\\\\')) {
            hasChanges = true;
            const filename = path.basename(doc);
            return `${baseUrl}/uploads/${filename}`;
          }
          return doc;
        });
        
        if (hasChanges) {
          gig.documents = newDocs;
        }
      }
      
      // Save if changes were made
      if (hasChanges) {
        await gig.save();
        fixed++;
      }
    }
    
    res.json({ 
      message: `Fixed ${fixed} gigs with incorrect image paths`,
      total: gigs.length
    });
  } catch (error) {
    console.error('Error fixing gig images:', error);
    res.status(500).json({ error: 'Failed to fix gig images' });
  }
});

// Admin endpoint to check gig status and images
apiRouter.get('/admin/gigs-status', async (req: Request, res: Response) => {
  try {
    const gigs = await Gig.find().limit(10).sort({ createdAt: -1 });
    
    const gigsReport = gigs.map(gig => ({
      id: gig._id,
      title: gig.title,
      status: gig.status,
      createdAt: gig.createdAt,
      imageCount: gig.images.length,
      imageUrls: gig.images,
      hasCloudinaryImages: gig.images.some(url => url.includes('cloudinary.com')),
      hasLocalImages: gig.images.some(url => !url.includes('cloudinary.com') || url.includes('uploads')),
    }));
    
    const summary = {
      total: gigs.length,
      active: gigs.filter(gig => gig.status === 'active').length,
      withCloudinaryImages: gigsReport.filter(gig => gig.hasCloudinaryImages).length,
      withLocalImages: gigsReport.filter(gig => gig.hasLocalImages).length,
    };
    
    res.json({
      summary,
      gigs: gigsReport
    });
  } catch (error) {
    console.error('Error checking gigs status:', error);
    res.status(500).json({ error: 'Failed to check gigs status' });
  }
});

// Create escrow payment session
apiRouter.post('/payments/create-escrow', async (req: Request, res: Response) => {
  try {
    const { gigId, packageType, buyerId, amount } = req.body;

    // Validate required fields
    if (!gigId || !packageType || !buyerId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get gig details
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    // Get freelancer details
    const freelancer = await Freelancer.findOne({ email: gig.userEmail });
    if (!freelancer) {
      return res.status(404).json({ error: 'Freelancer not found' });
    }

    // Create escrow payment (you'll need to integrate with an escrow service)
    // This is a placeholder for the actual escrow integration
    const escrowPayment = {
      id: `escrow_${Date.now()}`,
      amount,
      currency: 'USD',
      buyerId,
      sellerId: freelancer.userId,
      gigId,
      packageType,
      status: 'pending'
    };

    // Store escrow payment details in your database
    // You'll need to create a Payment model for this

    // Return payment URL (this would come from your escrow service)
    res.json({
      paymentUrl: `/checkout/${escrowPayment.id}`,
      paymentId: escrowPayment.id
    });
  } catch (error) {
    console.error('Error creating escrow payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Add this after other endpoints but before app.listen
apiRouter.post('/payments/create-checkout', async (req: Request, res: Response) => {
  try {
    const { gigId, packageType, buyerId, amount, metadata } = req.body;

    // Validate required fields
    if (!gigId || !packageType || !buyerId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get gig details
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    // Get freelancer details
    const freelancer = await Freelancer.findOne({ email: gig.userEmail });
    if (!freelancer) {
      return res.status(404).json({ error: 'Freelancer not found' });
    }

    // Create a new payment record
    const payment = new Payment({
      paymentId: `pay_${Date.now()}`,
      amount,
      currency: 'USD',
      buyerId,
      sellerId: freelancer.userId,
      gigId,
      packageType,
      status: 'pending',
      metadata
    });

    // Save the payment record
    await payment.save();

    // For now, we'll redirect to a simple checkout page
    // In production, you should integrate with a payment provider like Stripe
    const checkoutUrl = `/checkout/${payment.paymentId}`;

    res.json({
      checkoutUrl,
      paymentId: payment.paymentId
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Add this after the create-checkout endpoint
apiRouter.get('/payments/:paymentId', async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findOne({ paymentId }).populate('gigId');
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      paymentId: payment.paymentId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      metadata: payment.metadata
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// Mount API routes
app.use('/api', apiRouter);
app.use('/api/payments', paymentsRouter);

// Serve frontend from dist folder
const distPath = path.join(__dirname, '..', '..', 'dist');
app.use(express.static(distPath));

// Serve index.html for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 5173;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
