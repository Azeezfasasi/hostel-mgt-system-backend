const RoomRequest = require('../models/RoomRequest');
const Room = require('../models/Room');

exports.getRooms = async (req, res) => {
    try {
                const rooms = await Room.find()
                    .populate('hostelId', 'name hostelCampus')
                    .populate('assignedStudents', 'firstName lastName matricNumber');
        res.status(200).json({ success: true, count: rooms.length, data: rooms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getRoomById = async (req, res) => {
    try {
                const room = await Room.findById(req.params.id)
                    .populate('hostelId', 'name hostelCampus')
                    .populate('assignedStudents', 'firstName lastName matricNumber');
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }
        res.status(200).json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Student: get their own room requests
exports.getMyRoomRequests = async (req, res) => {
    try {
        const requests = await RoomRequest.find({ student: req.user.id })
            .populate('student')
            .populate({
                path: 'room',
                populate: { path: 'hostelId', select: 'name' }
            })
            .sort({ createdAt: -1 });
        // Only return approved requests with valid room details for the card
        const formatted = requests
          .filter(r => r.status === 'approved' && r.room)
          .map(r => ({
            _id: r._id,
            status: r.status,
            bed: r.bed,
            createdAt: r.createdAt,
            student: r.student,
            room: r.room,
          }));
        res.json({ success: true, requests: formatted });
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

// Student: create a room request
exports.createRoomRequest = async (req, res) => {
    try {
        const studentId = req.user ? req.user.id : req.body.studentId;
        const { roomId, bed } = req.body;
        if (!studentId || !roomId || typeof bed !== 'number') {
            return res.status(400).json({ success: false, message: 'roomId, bed, and studentId are required' });
        }
        // Check for duplicate pending request
        const existing = await RoomRequest.findOne({ student: studentId, room: roomId, bed, status: 'pending' });
        if (existing) {
            return res.status(400).json({ success: false, message: 'You already have a pending request for this bed.' });
        }
        // Create request with paymentStatus: 'pending'
        const request = await RoomRequest.create({ student: studentId, room: roomId, bed, status: 'pending', paymentStatus: 'pending' });
        res.status(201).json({ success: true, data: request });
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
        // Assign student to bed (ensure ObjectId)
        room.assignedStudents[request.bed] = request.student._id ? request.student._id : request.student;
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
        // Allow declining both pending and approved requests
        if (request.status === 'declined') return res.status(400).json({ success: false, message: 'Request already processed' });
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

// Get true room history for all students
exports.getAllRoomHistory = async (req, res) => {
    try {
        // Find all room requests (approved, declined, unassigned)
        const requests = await RoomRequest.find()
            .populate('student', 'firstName lastName otherName email matricNumber dob phone emergencyContact nextOfKinName nextOfKinRelationship nextOfKinPhone nin department course level profileImage gender onboardingCompleted')
            .populate({
                path: 'room',
                populate: { path: 'hostelId', select: 'name' }
            })
            .sort({ createdAt: -1 });
        // Group by student
        const history = {};
        requests.forEach(r => {
            const s = r.student;
            if (!s || !s._id) return;
            if (!history[s._id]) history[s._id] = { student: s, rooms: [] };
            history[s._id].rooms.push({
                status: r.status,
                hostel: r.room?.hostelId?.name,
                block: r.room?.roomBlock,
                floor: r.room?.roomFloor,
                room: r.room?.roomNumber,
                bed: r.bed !== undefined ? `Bed ${Number(r.bed) + 1}` : '-',
                roomId: r.room?._id,
                createdAt: r.createdAt,
                requestId: r._id,
            });
        });
        res.json({ success: true, data: Object.values(history) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get all current allocations (students with their room details)
exports.getAllAllocations = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('hostelId', 'name hostelCampus block floor')
      .populate('assignedStudents', 'firstName lastName otherName email matricNumber dob phone emergencyContact nextOfKinName nextOfKinRelationship nextOfKinPhone nin department course level profileImage gender onboardingCompleted');
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
        // Debug logging
        console.log('Assigned students:', room.assignedStudents.map(s => s && s.toString()), 'Student to unassign:', studentId);
        // Use ObjectId comparison for robustness
        const idx = room.assignedStudents.findIndex(s => s && s.equals ? s.equals(studentId) : s == studentId);
        if (idx === -1) {
            return res.status(400).json({ success: false, message: `Student not assigned to this room. Assigned: ${room.assignedStudents.map(s => s && s.toString()).join(', ')}. Tried to unassign: ${studentId}` });
        }
        room.assignedStudents.splice(idx, 1);
        room.currentOccupancy = Math.max(0, room.currentOccupancy - 1);
        await room.save();
        res.json({ success: true, message: 'Student unassigned from room' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
