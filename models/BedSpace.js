const mongoose = require('mongoose');

const bedSpaceSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  bedNumber: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
}, { timestamps: true });

module.exports = mongoose.model('BedSpace', bedSpaceSchema);
