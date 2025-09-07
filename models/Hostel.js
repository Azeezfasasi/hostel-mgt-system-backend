const mongoose = require('mongoose');

const HostelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Hostel name is required'],
        trim: true,
        unique: true
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

module.exports = mongoose.model('Hostel', HostelSchema);
