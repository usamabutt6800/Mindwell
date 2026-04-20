const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Load environment variables
require('dotenv').config();

// Debug: Check if environment variables are loaded
console.log('🔧 Cloudinary Configuration Check:');
console.log('   CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Loaded' : '❌ NOT LOADED');
console.log('   CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Loaded' : '❌ NOT LOADED');
console.log('   CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Loaded (hidden)' : '❌ NOT LOADED');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo',
  secure: true
});

console.log('✅ Cloudinary configured with cloud_name:', process.env.CLOUDINARY_CLOUD_NAME || 'demo');

class CloudinaryService {
  /**
   * Upload image to Cloudinary (FIXED VERSION)
   */
  static async uploadImage(filePath, folder = 'mindwell_payments') {
    try {
      console.log('\n📤 Cloudinary Upload Starting...');
      console.log('   File:', filePath);
      console.log('   Folder:', folder);
      console.log('   Exists:', fs.existsSync(filePath) ? '✅ Yes' : '❌ No');
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Read file as buffer for better compatibility
      const fileBuffer = fs.readFileSync(filePath);
      console.log('   File size:', fileBuffer.length, 'bytes');

      // Convert buffer to base64 for Cloudinary
      const fileBase64 = `data:${this.getMimeType(filePath)};base64,${fileBuffer.toString('base64')}`;

      console.log('   Uploading to Cloudinary...');
      
      // Upload with promise
      const uploadPromise = promisify(cloudinary.uploader.upload.bind(cloudinary.uploader));
      const result = await uploadPromise(fileBase64, {
        folder: folder,
        resource_type: 'auto',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'gif'],
        timeout: 60000 // 60 second timeout
      });

      console.log('✅ Cloudinary Upload Successful!');
      console.log('   URL:', result.secure_url);
      console.log('   Public ID:', result.public_id);
      console.log('   Format:', result.format);

      // Clean up local file
      try {
        fs.unlinkSync(filePath);
        console.log('   Local file cleaned up');
      } catch (cleanupError) {
        console.warn('   Could not delete local file:', cleanupError.message);
      }

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes
      };

    } catch (error) {
      console.error('❌ Cloudinary Upload Failed:');
      console.error('   Error:', error.message);
      console.error('   Stack:', error.stack);
      
      // Check specific error types
      if (error.message.includes('Invalid credentials')) {
        console.error('   💡 Hint: Check your Cloudinary API credentials in .env');
      } else if (error.message.includes('timeout')) {
        console.error('   💡 Hint: Network timeout. Check internet connection.');
      } else if (error.message.includes('file size')) {
        console.error('   💡 Hint: File might be too large (>10MB)');
      }

      return {
        success: false,
        error: error.message || 'Cloudinary upload failed'
      };
    }
  }

  /**
   * Get MIME type from file extension
   */
  static getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Validate file
   */
  static validateFile(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    if (!allowedTypes.includes(file.mimetype)) {
      return { 
        valid: false, 
        error: `Invalid file type (${file.mimetype}). Allowed: JPG, PNG, PDF.` 
      };
    }

    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max: 10MB.` 
      };
    }

    return { valid: true };
  }

  /**
   * Get upload folder
   */
  static getUploadFolder() {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('📁 Created upload directory:', uploadDir);
    }
    
    return uploadDir;
  }

  /**
   * Test Cloudinary connection
   */
  static async testConnection() {
    try {
      console.log('🧪 Testing Cloudinary connection...');
      const result = await cloudinary.api.ping();
      console.log('✅ Cloudinary connection test passed');
      return { success: true, message: 'Cloudinary is connected' };
    } catch (error) {
      console.error('❌ Cloudinary connection test failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = CloudinaryService;