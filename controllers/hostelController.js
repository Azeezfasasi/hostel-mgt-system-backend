const Hostel = require('../models/Hostel');

exports.getHostels = async (req, res) => {
    try {
        const hostels = await Hostel.find();
        res.status(200).json({ success: true, count: hostels.length, data: hostels });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getHostelById = async (req, res) => {
    try {
        const hostel = await Hostel.findById(req.params.id);
        if (!hostel) {
            return res.status(404).json({ success: false, message: 'Hostel not found' });
        }
        res.status(200).json({ success: true, data: hostel });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createHostel = async (req, res) => {
    try {
        const hostel = await Hostel.create(req.body);
        res.status(201).json({ success: true, data: hostel });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateHostel = async (req, res) => {
    try {
        const hostel = await Hostel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!hostel) {
            return res.status(404).json({ success: false, message: 'Hostel not found' });
        }
        res.status(200).json({ success: true, data: hostel });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteHostel = async (req, res) => {
    try {
        const hostel = await Hostel.findByIdAndDelete(req.params.id);
        if (!hostel) {
            return res.status(404).json({ success: false, message: 'Hostel not found' });
        }
        res.status(200).json({ success: true, message: 'Hostel deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
