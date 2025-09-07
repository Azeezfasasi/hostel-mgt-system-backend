const Attendance = require('../models/Attendance.js');

exports.checkIn = async (req, res) => {
  try {
    const { student, room } = req.body;

    // Check if student is already checked in
    const existing = await Attendance.findOne({ student, checkOutTime: null });
    if (existing) {
      return res.status(400).json({ message: "Student already checked in" });
    }

    const attendance = new Attendance({ student, room });
    await attendance.save();

    res.status(201).json({ message: "Check-in successful", attendance });
  } catch (error) {
    res.status(400).json({ message: "Error checking in", error: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const { student } = req.body;

    const attendance = await Attendance.findOne({ student, checkOutTime: null });
    if (!attendance) {
      return res.status(404).json({ message: "No active check-in found" });
    }

    attendance.checkOutTime = new Date();
    await attendance.save();

    res.json({ message: "Check-out successful", attendance });
  } catch (error) {
    res.status(400).json({ message: "Error checking out", error: error.message });
  }
};

exports.getAttendanceRecords = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("student", "firstName lastName email")
      .populate("room", "roomNumber");
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance records", error: error.message });
  }
};
