// Assign a student to a room
const Room = require('../models/Room');

exports.getRooms = async (req, res) => {
    try {
        const rooms = await Room.find().populate('hostelId', 'name');
        res.status(200).json({ success: true, count: rooms.length, data: rooms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

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

exports.createRoom = async (req, res) => {
    try {
        const room = await Room.create(req.body);
        res.status(201).json({ success: true, data: room });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.assignRoom = async (req, res) => {
    try {
        const { studentId, roomId } = req.body;
        if (!studentId || !roomId) {
            return res.status(400).json({ success: false, message: 'studentId and roomId are required' });
        }
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }
        // Check if room is full
        if (room.currentOccupancy >= room.capacity) {
            return res.status(400).json({ success: false, message: 'Room is already full' });
        }
        // Check if student is already assigned
        if (room.assignedStudents.includes(studentId)) {
            return res.status(400).json({ success: false, message: 'Student already assigned to this room' });
        }
        room.assignedStudents.push(studentId);
        room.currentOccupancy += 1;
        await room.save();
        res.status(200).json({ success: true, message: 'Student assigned to room', data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

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

// Get all current allocations (students with their room details)
exports.getAllAllocations = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('hostelId', 'name block floor')
      .populate('assignedStudents', 'firstName lastName email matricNumber');
    // Flatten allocations: one entry per student per room
    const allocations = [];
    rooms.forEach(room => {
      room.assignedStudents.forEach((student, idx) => {
        allocations.push({
          student,
          hostel: room.hostelId,
          block: room.roomBlock,
          floor: room.roomFloor,
          room: room.roomNumber,
          bed: idx,
          roomId: room._id
        });
      });
    });
    res.json({ success: true, data: allocations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Unassign a student from a room
exports.unassignStudent = async (req, res) => {
  try {
    const { roomId, studentId } = req.body;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    const idx = room.assignedStudents.indexOf(studentId);
    if (idx === -1) return res.status(400).json({ success: false, message: 'Student not assigned to this room' });
    room.assignedStudents.splice(idx, 1);
    room.currentOccupancy = Math.max(0, room.currentOccupancy - 1);
    await room.save();
    res.json({ success: true, message: 'Student unassigned from room' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
