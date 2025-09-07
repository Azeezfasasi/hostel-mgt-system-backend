const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    hostelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel',
        required: [true, 'Hostel ID is required']
    },
    roomNumber: {
        type: String,
        required: [true, 'Room number is required'],
        trim: true
    },
    capacity: {
        type: Number,
        required: [true, 'Capacity is required'],
        min: [1, 'Capacity must be at least 1']
    },
    currentOccupancy: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    facilities: {
        type: [String],
        default: []
    },
    status: {
        type: String,
        enum: ['available', 'occupied', 'under-maintenance'],
        default: 'available'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Room', RoomSchema);
