const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  audience: { type: String, enum: ["all", "students", "staff"], default: "all" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // usually admin
}, { timestamps: true });

module.exports = mongoose.model("Announcement", announcementSchema);
