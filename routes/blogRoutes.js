const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { auth, authorizeRoles } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Public: Get all blogs, get single blog, get categories
// GET /api/blog
router.get('/', blogController.getBlogs);

// GET /api/blog/categories
router.get('/categories', blogController.getCategories);

// GET /api/blog /api/blog/:ID
router.get('/:id', blogController.getBlogById);

// Protected: Create, edit, delete, change status (admin/super admin)
// POST /api/blog
router.post('/', auth, authorizeRoles, upload.single('image'), blogController.createBlog);

// PUT /api/blog/:id
router.put('/:id', auth, authorizeRoles, upload.single('image'), blogController.editBlog);

// DELETE /api/blog/:id
router.delete('/:id', auth, authorizeRoles, blogController.deleteBlog);

// PATCH /api/blog/:id/status
router.patch('/:id/status', auth, authorizeRoles, blogController.changeStatus);

module.exports = router;
