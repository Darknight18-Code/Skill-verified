import express from 'express';
import { Webhook } from 'svix';
import { UserModel } from '../../server/models/User';
import { Freelancer } from '../../server/models/Freelancer';
import { TestResultModel } from '../../server/models/TestResult';
import mongoose from 'mongoose';

const router = express.Router();

// Remove the duplicate TestResult schema and model definition
// const TestResultSchema = new mongoose.Schema({
//   skillId: String,
//   userId: String,
//   score: Number,
//   passed: Boolean,
//   answers: [{
//     questionId: String,
//     answer: Number,
//     correct: Boolean
//   }],
//   createdAt: Date
// });

// const TestResult = mongoose.model('TestResult', TestResultSchema);

router.post('/', async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
  }

  // Get the headers
  const headerPayload = req.headers;
  const svix_id = headerPayload["svix-id"];
  const svix_timestamp = headerPayload["svix-timestamp"];
  const svix_signature = headerPayload["svix-signature"];

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(req.body, {
      "svix-id": svix_id as string,
      "svix-timestamp": svix_timestamp as string,
      "svix-signature": svix_signature as string,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).json({ error: 'Error verifying webhook' });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    try {
      const user = new UserModel({
        clerkId: id,
        email: email_addresses[0].email_address,
        firstName: first_name,
        lastName: last_name,
        skills: [],
        certifications: []
      });

      await user.save();
      console.log('✅ User created in database:', user.email);
    } catch (error) {
      console.error('❌ Error creating user:', error);
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    await UserModel.findOneAndUpdate(
      { clerkId: id },
      {
        email: email_addresses[0]?.email_address,
        firstName: first_name,
        lastName: last_name,
        profileImage: evt.data.profile_image_url,
      }
    );
    console.log(`🔄 User updated: ${first_name} ${last_name}`);
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      // Delete user data
      await UserModel.deleteOne({ clerkId: id });
      console.log('✅ User deleted from database:', id);

      // Delete freelancer profile if exists
      await Freelancer.deleteOne({ userId: id });
      console.log('✅ Freelancer profile deleted:', id);

      // Delete test results
      await TestResultModel.deleteMany({ userId: id });
      console.log('✅ Test results deleted for user:', id);

    } catch (error) {
      console.error('❌ Error deleting user data:', error);
    }
  }

  res.json({ success: true });
});

export default router;
