const mongoose = require('mongoose');

const disciplinaryActionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  actionType: { type: String, enum: ["warning", "suspension", "blacklist"], required: true },
  reason: { type: String, required: true },
  staff: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("DisciplinaryAction", disciplinaryActionSchema);
