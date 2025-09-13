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
// GET - /api/room
router.get('/', getRooms);

// GET - /api/room/:id
router.get('/:id', getRoomById);

// Private routes for authenticated users with Admin or Staff roles
// POST - /api/room
router.post('/', auth, authorizeRoles, createRoom);

// PUT - /api/room/:id
router.put('/:id', auth, authorizeRoles, updateRoom);

// DELETE - /api/room/:id
router.delete('/:id', auth, authorizeRoles, deleteRoom);

module.exports = router;
