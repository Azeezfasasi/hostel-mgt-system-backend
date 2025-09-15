const express = require('express');
const { 
    getHostels, 
    getHostelById, 
    createHostel, 
    updateHostel, 
    deleteHostel,
    getPublicStats
} = require('../controllers/hostelController');
const { auth, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Public routes
// GET - /api/hostel
router.get('/', getHostels);

// GET - /api/hostel/stats (public stats for students)
const { getPublicStats } = require('../controllers/hostelController');
router.get('/stats', getPublicStats);

// GET - /api/hostel/:id
router.get('/:id', getHostelById);

// Private routes for authenticated and authorized users
// POST - /api/hostel
router.post('/', auth, authorizeRoles, createHostel);

// PUT - /api/hostel/:id
router.put('/:id', auth, authorizeRoles, updateHostel);

// DELETE - /api/hostel/:id
router.delete('/:id', auth, authorizeRoles, deleteHostel);

module.exports = router;
