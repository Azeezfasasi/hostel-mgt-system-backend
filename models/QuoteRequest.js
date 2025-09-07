const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This tells Mongoose to link to your 'User' model
    required: false // Can be false if you allow replies without a logged-in user, but generally true for admin/customer replies
  },
  senderEmail: { type: String, required: true }, // The email of the sender (admin or customer)
  senderType: { type: String, enum: ['admin', 'superAdmin', 'super admin', 'customer'], required: true }, // 'admin' or 'customer'
  message: { type: String, required: true },
  repliedAt: { type: Date, default: Date.now }
});

const quoteRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: false },
  service: { type: String, required: true },
  message: { type: String, required: true },
  status: {
  type: String,
  enum: ['Waiting for Support', 'Waiting for Customer', 'Pending', 'In Review', 'In Progress', 'Done', 'Completed', 'Declined', 'Rejected', 'Resolved', 'Closed'],
  default: 'Waiting for Support'
  },
  replies: [replySchema],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    default: null // Can be null if not assigned
  },
  assignedAt: {
    type: Date,
    default: null // Will be set when assigned
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuoteRequest', quoteRequestSchema);