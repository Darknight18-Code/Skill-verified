require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinaryConnection() {
  try {
    console.log('Testing Cloudinary connection...');
    console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
    
    // Test the API connection by requesting account info
    const result = await cloudinary.api.ping();
    console.log('Cloudinary connection successful!');
    console.log('Response:', result);
    
    return true;
  } catch (error) {
    console.error('Cloudinary connection failed!');
    console.error('Error:', error.message);
    return false;
  }
}

async function main() {
  const connectionSuccessful = await testCloudinaryConnection();
  
  if (connectionSuccessful) {
    console.log('\nYour Cloudinary configuration is working correctly.');
    console.log('You can now create gigs with image uploads to Cloudinary!');
  } else {
    console.log('\nPlease check your Cloudinary credentials in the .env file:');
    console.log('CLOUDINARY_CLOUD_NAME=', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('CLOUDINARY_API_KEY=', process.env.CLOUDINARY_API_KEY);
    console.log('CLOUDINARY_API_SECRET=', process.env.CLOUDINARY_API_SECRET ? '[SECRET PRESENT]' : '[MISSING]');
  }
}

main().catch(console.error); 