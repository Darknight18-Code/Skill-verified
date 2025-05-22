import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define Cloudinary upload result type
interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  [key: string]: any;
}

// Log environment variables (without exposing sensitive data)
console.log('Environment variables check:', {
  hasCloudinaryUrl: !!process.env.CLOUDINARY_URL,
  hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
  hasApiKey: !!process.env.CLOUDINARY_API_KEY,
  hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  console.log('Configuring Cloudinary with URL');
  cloudinary.config(process.env.CLOUDINARY_URL);
} else {
  console.log('Configuring Cloudinary with individual credentials');
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Missing required Cloudinary credentials. Please check your environment variables.');
  }
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Log the current configuration
console.log('Current Cloudinary configuration:', {
  cloud_name: cloudinary.config().cloud_name || 'Not set',
  api_key: cloudinary.config().api_key ? 'Set' : 'Not set',
  api_secret: cloudinary.config().api_secret ? 'Set' : 'Not set'
});

/**
 * Uploads a file to Cloudinary - Supports both file paths and buffers
 * @param fileOrBuffer - The file path or buffer to upload
 * @param folder - Optional folder to upload to
 * @param metadata - Optional metadata to attach to the upload (key-value pairs)
 * @param fileOptions - Optional file-related options like filename and mimetype (required for buffer uploads)
 * @returns Promise with the upload result
 */
export const uploadToCloudinary = async (
  fileOrBuffer: string | Buffer, 
  folder = 'gigs', 
  metadata?: Record<string, string>,
  fileOptions?: { filename?: string; mimetype?: string }
): Promise<string> => {
  try {
    console.log('Starting Cloudinary upload:', { 
      fileType: typeof fileOrBuffer === 'string' ? 'filePath' : 'buffer',
      folder,
      hasMetadata: !!metadata
    });
    
    // Prepare upload options
    const uploadOptions: any = {
      folder,
      resource_type: 'auto', // Use auto to determine type based on file content
      upload_preset: 'ml_default', // Add upload preset for better compatibility
    };
    
    // Add metadata if provided
    if (metadata && Object.keys(metadata).length > 0) {
      console.log('📋 METADATA INFO - Including metadata with upload:');
      Object.entries(metadata).forEach(([key, value]) => {
        console.log(`🔹 ${key}: ${value || 'Not provided'}`);
      });
      
      uploadOptions.context = Object.entries(metadata)
        .map(([key, value]) => `${key}=${value}`)
        .join('|');
    }

    let result: CloudinaryUploadResult;
    
    if (typeof fileOrBuffer === 'string') {
      // Check if file exists (for file path uploads)
      const fs = require('fs');
      if (!fs.existsSync(fileOrBuffer)) {
        throw new Error(`File not found at path: ${fileOrBuffer}`);
      }

      // Get file stats
      const stats = fs.statSync(fileOrBuffer);
      console.log('File details:', {
        size: stats.size,
        path: fileOrBuffer,
        exists: true
      });
      
      // For videos, set resource_type explicitly
      if (fileOrBuffer.match(/\.(mp4|webm|mov|avi|mkv)$/i)) {
        uploadOptions.resource_type = 'video';
        uploadOptions.allowed_formats = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
      }
      
      result = await cloudinary.uploader.upload(fileOrBuffer, uploadOptions);
    } else {
      // Buffer upload
      console.log('Buffer upload details:', {
        bufferSize: fileOrBuffer.length,
        filename: fileOptions?.filename || 'unknown',
        mimetype: fileOptions?.mimetype || 'application/octet-stream'
      });
      
      // For videos, set resource_type explicitly
      if (fileOptions?.mimetype?.startsWith('video/') || fileOptions?.filename?.match(/\.(mp4|webm|mov|avi|mkv)$/i)) {
        uploadOptions.resource_type = 'video';
        uploadOptions.allowed_formats = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
      }
      
      // For buffer uploads, we use the upload_stream approach
      result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) return reject(error);
            resolve(result as CloudinaryUploadResult);
          }
        );
        
        // Create a buffer stream and pipe to upload stream
        const { Readable } = require('stream');
        const bufferStream = new Readable();
        bufferStream.push(fileOrBuffer);
        bufferStream.push(null); // End of stream
        bufferStream.pipe(uploadStream);
      });
    }
    
    console.log('✅ UPLOAD SUCCESS - Cloudinary upload completed successfully:');
    console.log('🔗 URL:', result.secure_url);
    console.log('🆔 Public ID:', result.public_id);
    console.log('📁 Format:', result.format);
    
    // Log metadata info again to confirm it was properly processed
    if (metadata && Object.keys(metadata).length > 0) {
      console.log('📋 METADATA CONFIRMATION - Metadata attached');
    }
    
    return result.secure_url;
  } catch (error: any) {
    console.error('Cloudinary upload error:', {
      message: error.message,
      code: error.code,
      http_code: error.http_code,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Uploads multiple files to Cloudinary
 * @param files - Array of file paths
 * @param folder - Optional folder to upload to
 * @param metadata - Optional metadata to attach to all uploads
 * @returns Promise with array of upload results
 */
export const uploadMultipleToCloudinary = async (
  filePaths: string[], 
  folder = 'gigs',
  metadata?: Record<string, string>
): Promise<string[]> => {
  try {
    console.log('Starting batch upload to Cloudinary:', { fileCount: filePaths.length, folder, hasMetadata: !!metadata });
    const uploadPromises = filePaths.map(file => uploadToCloudinary(file, folder, metadata));
    const results = await Promise.all(uploadPromises);
    console.log('Batch upload completed successfully');
    return results;
  } catch (error) {
    console.error('Batch upload error:', error);
    throw error;
  }
};

/**
 * Uploads a buffer directly to Cloudinary
 * @param buffer - The buffer to upload
 * @param folder - Optional folder to upload to
 * @param metadata - Optional metadata to attach to the upload (key-value pairs)
 * @param fileOptions - Optional file-related options like filename and mimetype
 * @returns Promise with the upload result
 */
export const uploadBufferToCloudinary = async (
  buffer: Buffer, 
  folder = 'gigs', 
  metadata?: Record<string, string>,
  fileOptions?: { filename?: string; mimetype?: string }
): Promise<string> => {
  return uploadToCloudinary(buffer, folder, metadata, fileOptions);
};

export default cloudinary;