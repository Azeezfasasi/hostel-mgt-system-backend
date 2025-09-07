const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  checkInTime: { type: Date, default: Date.now },
  checkOutTime: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
