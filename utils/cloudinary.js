const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,     
  api_secret: process.env.api_secret
});

// Set up Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mgv-projects', // Folder name in your Cloudinary account
    allowed_formats: ['jpeg', 'png', 'jpg', 'webp'],
    transformation: [{ width: 1000, height: 750, crop: 'limit' }], // Optional: optimize image size
  },
});

// Multer upload middleware configured with Cloudinary storage
const upload = multer({ storage: storage });

module.exports = {cloudinary, upload,};
