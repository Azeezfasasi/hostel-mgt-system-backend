const mongoose = require('mongoose');

const DamageReportSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  reportedAt: { type: Date, default: Date.now },
  repairStatus: { type: String, default: 'Pending' },
  repairUpdate: { type: String, default: '' }
});

const FurnitureSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'FurnitureCategory', required: true },
  quantity: { type: Number, default: 1 },
  location: { type: String },
  condition: { type: String, enum: ['Good', 'Needs Repair', 'Damaged'], default: 'Good' },
  status: { type: String, enum: ['active', 'inactive', 'in-use', 'damage', 'under-repair'], default: 'active' },
  damageReports: [DamageReportSchema]
}, { timestamps: true });

const FurnitureCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = {
  Furniture: mongoose.model('Furniture', FurnitureSchema),
  FurnitureCategory: mongoose.model('FurnitureCategory', FurnitureCategorySchema)
};
