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
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'FacilityCategory', required: true },
  location: { type: String },
  status: { type: String, enum: ['active', 'inactive', 'in-use', 'damage', 'under-repair'], default: 'active' },
  damageReports: [FacilityDamageReportSchema]
}, { timestamps: true });

module.exports = mongoose.model('Facility', FacilitySchema);