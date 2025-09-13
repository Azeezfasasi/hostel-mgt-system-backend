const RoomRequest = require('../models/RoomRequest');
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

// Admin: get all room requests
exports.getRoomRequests = async (req, res) => {
    try {
        const requests = await RoomRequest.find()
            .populate('student', 'firstName lastName email matricNumber')
            .populate({
                path: 'room',
                populate: { path: 'hostelId', select: 'name' }
            })
            .sort({ createdAt: -1 });
        res.json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: approve a room request
exports.approveRoomRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await RoomRequest.findById(id).populate('room');
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        if (request.status !== 'pending') return res.status(400).json({ success: false, message: 'Request already processed' });
        // Check if bed is available
        const room = await Room.findById(request.room._id);
        if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
        if (room.assignedStudents[request.bed]) return res.status(400).json({ success: false, message: 'Bed already occupied' });
        // Assign student to bed
        room.assignedStudents[request.bed] = request.student;
        room.currentOccupancy = (room.assignedStudents.filter(Boolean).length);
        await room.save();
        request.status = 'approved';
        await request.save();
        res.json({ success: true, message: 'Request approved and student assigned', data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: decline a room request
exports.declineRoomRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await RoomRequest.findById(id);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        if (request.status !== 'pending') return res.status(400).json({ success: false, message: 'Request already processed' });
        request.status = 'declined';
        await request.save();
        res.json({ success: true, message: 'Request declined', data: request });
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

// Student books a room (with bed index)
exports.bookRoom = async (req, res) => {
    try {
        const studentId = req.user ? req.user.id : req.body.studentId; // Prefer JWT user, fallback to body
        const { roomId, bedIndex } = req.body;
        if (!studentId || !roomId || typeof bedIndex !== 'number') {
            return res.status(400).json({ success: false, message: 'roomId, bedIndex, and studentId are required' });
        }
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }
        // Check if bedIndex is valid
        if (bedIndex < 0 || bedIndex >= room.capacity) {
            return res.status(400).json({ success: false, message: 'Invalid bed index' });
        }
        // Check if bed is already occupied
        if (room.assignedStudents[bedIndex]) {
            return res.status(400).json({ success: false, message: 'Bed already occupied' });
        }
        // Check if student is already assigned to any bed in this room
        if (room.assignedStudents.includes(studentId)) {
            return res.status(400).json({ success: false, message: 'You are already assigned to this room' });
        }
        // Assign student to the selected bed
        room.assignedStudents[bedIndex] = studentId;
        room.currentOccupancy = (room.assignedStudents.filter(Boolean).length);
        await room.save();
        res.status(200).json({ success: true, message: 'Room booked successfully', data: room });
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
