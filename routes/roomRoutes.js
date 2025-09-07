const express = require('express');
const { 
    getRooms, 
    getRoomById, 
    createRoom, 
    updateRoom, 
    deleteRoom 
} = require('../controllers/roomController');
const { auth, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Public routes for fetching rooms
router.get('/', getRooms);
router.get('/:id', getRoomById);

// Private routes for authenticated users with Admin or Staff roles
router.post('/', auth, authorizeRoles, createRoom);
router.put('/:id', auth, authorizeRoles, updateRoom);
router.delete('/:id', auth, authorizeRoles, deleteRoom);

module.exports = router;
