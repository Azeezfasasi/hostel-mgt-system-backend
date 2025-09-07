const Room = require('../models/Room');

// @desc    Get all rooms
// @route   GET /api/v1/rooms
// @access  Public
exports.getRooms = async (req, res) => {
    try {
        const rooms = await Room.find().populate('hostelId', 'name');
        res.status(200).json({ success: true, count: rooms.length, data: rooms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get a single room by ID
// @route   GET /api/v1/rooms/:id
// @access  Public
exports.getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).populate('hostelId', 'name');
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }
        res.status(200).json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a new room
// @route   POST /api/v1/rooms
// @access  Private (Admin/Staff)
exports.createRoom = async (req, res) => {
    try {
        const room = await Room.create(req.body);
        res.status(201).json({ success: true, data: room });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update a room by ID
// @route   PUT /api/v1/rooms/:id
// @access  Private (Admin/Staff)
exports.updateRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }
        res.status(200).json({ success: true, data: room });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete a room by ID
// @route   DELETE /api/v1/rooms/:id
// @access  Private (Admin/Staff)
exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }
        res.status(200).json({ success: true, message: 'Room deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
