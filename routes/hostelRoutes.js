const express = require('express');
const { 
    getHostels, 
    getHostelById, 
    createHostel, 
    updateHostel, 
    deleteHostel 
} = require('../controllers/hostelController');
const { auth, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getHostels);
router.get('/:id', getHostelById);

// Private routes for authenticated and authorized users
router.post('/', auth, authorizeRoles, createHostel);
router.put('/:id', auth, authorizeRoles, updateHostel);
router.delete('/:id', auth, authorizeRoles, deleteHostel);

module.exports = router;
