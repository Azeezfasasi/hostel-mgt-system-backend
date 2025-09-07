const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  content: { type: String, required: true },
  sentAt: { type: Date },
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipients: [{ type: String }], // List of emails
  status: { type: String, enum: ['draft', 'sent'], default: 'draft' },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Newsletter', newsletterSchema);
