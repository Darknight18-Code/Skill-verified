require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  console.log('Using CLOUDINARY_URL from environment');
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

// Create a simple test image
const testImagePath = path.join(__dirname, 'test-image.jpg');
const createSimpleImage = () => {
  console.log('Creating a simple test image...');
  // Create a 1x1 pixel image with binary data
  const simpleImageData = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
    0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xc2, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00,
    0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x10, 0x01, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x01, 0x3f,
    0x10
  ]);
  
  try {
    fs.writeFileSync(testImagePath, simpleImageData);
    console.log('Test image created at:', testImagePath);
    return true;
  } catch (error) {
    console.error('Error creating test image:', error);
    return false;
  }
};

async function testUpload() {
  console.log('Starting Cloudinary upload test...');
  
  // Check if test image exists, create if not
  if (!fs.existsSync(testImagePath)) {
    if (!createSimpleImage()) {
      return false;
    }
  }
  
  try {
    console.log('Uploading test image from:', testImagePath);
    const result = await cloudinary.uploader.upload(testImagePath, {
      folder: 'test',
      resource_type: 'auto'
    });
    
    console.log('Upload successful!');
    console.log('Uploaded image URL:', result.secure_url);
    console.log('Image details:', {
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    });
    
    return true;
  } catch (error) {
    console.error('Upload failed with error:', error.message);
    if (error.http_code) {
      console.error('HTTP status code:', error.http_code);
    }
    
    return false;
  }
}

async function main() {
  console.log('Cloudinary Test');
  console.log('---------------');
  console.log('Environment:');
  if (process.env.CLOUDINARY_URL) {
    console.log('CLOUDINARY_URL is set');
  } else {
    console.log('Individual variables:');
    console.log('- CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || 'Not set');
    console.log('- CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set');
    console.log('- CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set');
  }
  console.log('---------------');
  
  const uploadSuccessful = await testUpload();
  
  if (uploadSuccessful) {
    console.log('\n✅ Cloudinary connection successful!');
    console.log('You can now create gigs with Cloudinary image uploads.');
    
    // Clean up test image
    try {
      fs.unlinkSync(testImagePath);
      console.log('Test image cleaned up.');
    } catch (err) {
      console.error('Failed to clean up test image:', err.message);
    }
  } else {
    console.log('\n❌ Cloudinary connection failed!');
    console.log('Please check your Cloudinary credentials and network connectivity.');
  }
}

main().catch(console.error); 