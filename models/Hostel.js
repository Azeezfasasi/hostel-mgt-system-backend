const mongoose = require('mongoose');

const HostelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Hostel name is required'],
        trim: true
    },
    hostelCampus: {
        type: String,
        required: [true, 'Hostel campus is required'],
        trim: true
    },
    block: {
        type: String,
        required: [true, 'Block is required'],
        trim: true
    },
    floor: {
        type: String,
        required: [true, 'Floor is required'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    genderRestriction: {
        type: String,
        enum: ['male', 'female', 'mixed'],
        default: 'mixed'
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    facilities: {
        type: [String],
        default: []
    },
    rulesAndPolicies: {
        type: String,
        default: 'No specific rules or policies defined yet.'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Compound unique index for name + hostelCampus
HostelSchema.index({ name: 1, hostelCampus: 1 }, { unique: true });

module.exports = mongoose.model('Hostel', HostelSchema);
