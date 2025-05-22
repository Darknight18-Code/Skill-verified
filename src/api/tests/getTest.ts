import { Request, Response } from 'express';
import { SkillTestModel } from '../../server/models/SkillTestModal';
import { TestResultModel } from '../../server/models/TestResult';
import mongoose from 'mongoose';
import { uploadToCloudinary } from '../../config/cloudinary';
import fs from 'fs';

// ✅ Fetch Skill Test
export const getTest = async (req: Request, res: Response) => {
  const skillId = String(req.params.skillId); // ✅ Ensure 'skillId' is treated as a string
  console.log('Skill ID from request params:', skillId);

  try {
    await mongoose.connection.asPromise();
    const test = await SkillTestModel.findOne({ skillId });

    if (!test) {
      console.log('⚠️ No test found for skillId:', skillId);
      return res.status(404).json({ message: 'Test not found' });
    }

    console.log('✅ Test found:', test);
    res.status(200).json(test);
  } catch (error) {
    console.error('❌ Error fetching test:', error);
    res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
  }
};

// ✅ Submit Test Result (New API)
export const submitTestResult = async (req: Request, res: Response) => {
  const { skillId, userId, email, score, passed, answers, category, requiresEvaluation } = req.body;
  
  console.log('Starting test submission processing', { body: req.body, file: req.file });

  if (!skillId || !userId || score === undefined || passed === undefined) {
    return res.status(400).json({ message: 'Missing required fields: skillId, userId, score, or passed' });
  }

  try {
    await mongoose.connection.asPromise();
    
    // Check if user has already passed this test
    const existingResult = await TestResultModel.findOne({ 
      userId, 
      skillId,
      passed: true 
    });

    if (existingResult) {
      return res.status(400).json({ 
        error: 'Test Already Passed',
        details: 'You have already passed this test and cannot retake it'
      });
    }

    // Process screen recording if present
    let screenRecordingUrl = null;
    if (req.file) {
      try {
        console.log('Processing screen recording upload...', {
          filePath: req.file.path,
          size: req.file.size,
          mimetype: req.file.mimetype
        });

        // Verify file exists before upload
        if (!fs.existsSync(req.file.path)) {
          throw new Error(`Screen recording file not found at path: ${req.file.path}`);
        }

        // Upload with metadata
        screenRecordingUrl = await uploadToCloudinary(
          req.file.path, 
          'test-recordings',
          {
            userId,
            skillId,
            testDate: new Date().toISOString(),
            testScore: score.toString()
          }
        );

        console.log('✅ Screen recording uploaded successfully:', {
          url: screenRecordingUrl,
          size: req.file.size,
          type: req.file.mimetype
        });

        // Clean up temp file
        fs.unlinkSync(req.file.path);
        console.log('Temporary file cleaned up');
      } catch (error) {
        console.error('❌ Screen recording upload failed:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          filePath: req.file?.path,
          fileDetails: req.file
        });
      }
    }

    // Create test result
    const result = await TestResultModel.create({
      skillId,
      userId,
      email, // Store user email if provided
      score,
      passed,
      category,
      screenRecording: screenRecordingUrl,
      answers: answers || [],
      requiresEvaluation: requiresEvaluation === 'true' || requiresEvaluation === true,
      completedAt: new Date()
    });

    console.log('✅ Test result recorded:', {
      skillId,
      userId,
      email: email || 'Not provided',
      score,
      passed,
      category,
      screenRecording: screenRecordingUrl ? 'Uploaded' : 'None',
      requiresEvaluation: requiresEvaluation === 'true' || requiresEvaluation === true,
      answersCount: answers ? answers.length : 0
    });

    res.status(200).json({ 
      message: 'Test result recorded successfully',
      result 
    });
  } catch (error) {
    console.error('❌ Error submitting test result:', error);
    res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
  }
};
