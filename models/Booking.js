const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bedSpace: { type: mongoose.Schema.Types.ObjectId, ref: "BedSpace", required: true },
  status: { 
    type: String, 
    enum: ["pending", "confirmed", "cancelled", "waitingList"], 
    default: "pending" 
  },
  roommateIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  bookingDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
