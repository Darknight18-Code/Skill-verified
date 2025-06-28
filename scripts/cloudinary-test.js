// Simple Cloudinary test script
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log('Cloudinary Config:');
console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Present' : 'Missing');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Present' : 'Missing');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test ping
cloudinary.api.ping()
  .then(result => {
    console.log('Cloudinary connection successful!');
    console.log(result);
  })
  .catch(error => {
    console.error('Cloudinary connection failed!');
    console.error(error);
  });