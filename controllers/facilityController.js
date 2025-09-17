// Create a facility
exports.createFacility = async (req, res) => {
  try {
    const { name, location } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const facility = await Facility.create({ name, location });
    res.status(201).json(facility);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all facilities
exports.getAllFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find();
    res.json(facilities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get one facility by ID
exports.getFacilityById = async (req, res) => {
  try {
    const { id } = req.params;
    const facility = await Facility.findById(id);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });
    res.json(facility);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a facility
exports.updateFacility = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const facility = await Facility.findByIdAndUpdate(id, update, { new: true });
    if (!facility) return res.status(404).json({ error: 'Facility not found' });
    res.json(facility);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a facility
exports.deleteFacility = async (req, res) => {
  try {
    const { id } = req.params;
    const facility = await Facility.findByIdAndDelete(id);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });
    res.json({ message: 'Facility deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all damage reports for a facility
exports.getFacilityDamageReports = async (req, res) => {
  try {
    const { id } = req.params;
    const facility = await Facility.findById(id).populate('damageReports.student');
    if (!facility) return res.status(404).json({ error: 'Facility not found' });
    res.json(facility.damageReports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a damage report for a facility
exports.updateFacilityDamageReport = async (req, res) => {
  try {
    const { facilityId, reportId } = req.params;
    const { repairStatus, repairUpdate, description } = req.body;
    const facility = await Facility.findById(facilityId);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });
    const report = facility.damageReports.id(reportId);
    if (!report) return res.status(404).json({ error: 'Damage report not found' });
    if (repairStatus) report.repairStatus = repairStatus;
    if (repairUpdate) report.repairUpdate = repairUpdate;
    if (description) report.description = description;
    await facility.save();
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a damage report for a facility
exports.deleteFacilityDamageReport = async (req, res) => {
  try {
    const { facilityId, reportId } = req.params;
    const facility = await Facility.findById(facilityId);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });
    const report = facility.damageReports.id(reportId);
    if (!report) return res.status(404).json({ error: 'Damage report not found' });
    report.remove();
    await facility.save();
    res.json({ message: 'Damage report deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const Facility = require('../models/Facility');

exports.reportDamage = async (req, res) => {
  try {
    const { id } = req.params;
    const { student, description } = req.body;
    if (!student || !description) return res.status(400).json({ error: 'Student and description required' });
    const facility = await Facility.findById(id);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });
    facility.damageReports.push({ student, description });
    await facility.save();
    res.json(facility);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};