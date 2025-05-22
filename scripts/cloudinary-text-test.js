require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  console.log('Using CLOUDINARY_URL:', process.env.CLOUDINARY_URL);
  cloudinary.config({ 
    CLOUDINARY_URL: process.env.CLOUDINARY_URL 
  });
} else {
  console.log('Using individual Cloudinary credentials');
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Test file path
const testFilePath = path.join(__dirname, 'test-file.txt');

// Create test file if it doesn't exist
if (!fs.existsSync(testFilePath)) {
  console.log('Creating test file...');
  fs.writeFileSync(testFilePath, 'This is a test file for Cloudinary upload.');
  console.log('Test file created.');
}

async function testUpload() {
  console.log('Starting Cloudinary upload test...');
  
  try {
    console.log('Uploading test file from:', testFilePath);
    const result = await cloudinary.uploader.upload(testFilePath, {
      folder: 'test',
      resource_type: 'raw'  // Upload as raw file, not image
    });
    
    console.log('Upload successful!');
    console.log('Uploaded file URL:', result.secure_url);
    
    return true;
  } catch (error) {
    console.error('Upload failed with error:', error.message);
    if (error.http_code) {
      console.error('HTTP status code:', error.http_code);
    }
    
    // Print detailed error info
    console.error('Error details:', JSON.stringify(error, null, 2));
    return false;
  }
}

async function main() {
  console.log('Testing Cloudinary configuration...');
  
  try {
    // First test the Cloudinary config
    const config = cloudinary.config();
    console.log('Cloudinary configured with cloud name:', config.cloud_name);
    
    const uploadSuccessful = await testUpload();
    
    if (uploadSuccessful) {
      console.log('\n✅ Cloudinary connection successful!');
      console.log('You can now create gigs with Cloudinary file uploads.');
    } else {
      console.log('\n❌ Cloudinary connection failed!');
      console.log('Please check your Cloudinary credentials and network connectivity.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main().catch(console.error); 