const express = require('express');
const router = express.Router();
const {
  register,
  login,
  requestPasswordReset,
  resetPassword,
  getAllUsers,
  getProfile,
  updateProfile,
  editUser,
  deleteUser,
  disableUser,
  resetUserPassword,
  getAllAdmins
} = require('../controllers/userController');
const { auth, authorizeRoles } = require('../middleware/auth');

// Public routes 
// POST /api/users/register
router.post('/register', register);

// POST /api/users/login
router.post('/login', login);

// POST /api/users/request-password-reset
router.post('/request-password-reset', requestPasswordReset);

// POST /api/users//reset-password
router.post('/reset-password', resetPassword);

// PUT /api/users/:id/reset-password 
router.put('/:id/reset-password', auth, authorizeRoles, resetUserPassword);

// User routes
// GET /api/users/me
router.get('/me', auth, getProfile);

// GET /api/users/me
router.put('/me', auth, updateProfile);

// Admin/Super Admin routes
// GET /api/users
router.get('/', auth, authorizeRoles, getAllUsers);

// GET /api/users/admins (Admin/Super Admin only to get all admin users)
router.get('/admins', auth, authorizeRoles, getAllAdmins);

// PUT /api/users/:id
router.put('/:id', auth, authorizeRoles, editUser);

// DELETE /api/users/:id
router.delete('/:id', auth, authorizeRoles, deleteUser);

// PATCH /api/users:id/disable
router.patch('/:id/disable', auth, authorizeRoles, disableUser);

module.exports = router;