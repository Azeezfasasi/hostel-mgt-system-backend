const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, enum: ["maintenance", "electricity", "security", "other"], required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["open", "in-progress", "resolved", "closed", "pending"], default: "open" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // staff/admin
}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);
