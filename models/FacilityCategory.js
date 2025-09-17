const mongoose = require('mongoose');

const FacilityCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('FacilityCategory', FacilityCategorySchema);