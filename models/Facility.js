const mongoose = require('mongoose');

const FacilityDamageReportSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  reportedAt: { type: Date, default: Date.now },
  repairStatus: { type: String, default: 'Pending' },
  repairUpdate: { type: String, default: '' }
});

const FacilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  damageReports: [FacilityDamageReportSchema]
}, { timestamps: true });

module.exports = mongoose.model('Facility', FacilitySchema);