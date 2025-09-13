const express = require('express');
const { 
    getRooms, 
    getRoomById, 
    createRoom, 
    updateRoom, 
    deleteRoom, 
    assignRoom,
    getAllAllocations,
    unassignStudent,
    bookRoom
} = require('../controllers/roomController');
const { auth, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

// POST - /api/room/book (student booking)
router.post('/book', auth, bookRoom);

// Public routes for fetching rooms
// GET - /api/room
router.get('/', getRooms);


// GET - /api/room/allocations
router.get('/allocations', auth, authorizeRoles, getAllAllocations);

// POST - /api/room/unassign
router.post('/unassign', auth, authorizeRoles, unassignStudent);

// GET - /api/room/:id
router.get('/:id', getRoomById);

// Private routes for authenticated users with Admin or Staff roles
// POST - /api/room
router.post('/', auth, authorizeRoles, createRoom);

// POST - /api/room/assign
router.post('/assign', auth, authorizeRoles, assignRoom);

// PUT - /api/room/:id
router.put('/:id', auth, authorizeRoles, updateRoom);

// DELETE - /api/room/:id
router.delete('/:id', auth, authorizeRoles, deleteRoom);

module.exports = router;
