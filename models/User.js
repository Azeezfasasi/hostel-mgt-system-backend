const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  otherName: { type: String },
  dob: { type: String },
  gender: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  emergencyContact: { type: String },
  nextOfKinName: { type: String },
  nextOfKinRelationship: { type: String },
  nextOfKinPhone: { type: String },
  nin: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  bio: { type: String },
  matricNumber: { type: String },
  profileImage: { type: String },
  campusName: { type: String },
  department: { type: String },
  faculty: { type: String },
  course: { type: String },
  level: { type: String },
  role: {
    type: String,
    enum: ['super admin', 'admin', 'student', 'staff'],
    default: 'student'
  },
  isActive: { type: Boolean, default: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
