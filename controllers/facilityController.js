const FacilityCategory = require('../models/FacilityCategory');

// Create facility category
exports.createFacilityCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const category = await FacilityCategory.create({ name });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all facility categories
exports.getFacilityCategories = async (req, res) => {
  try {
    const categories = await FacilityCategory.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit facility category
exports.editFacilityCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    console.log('Edit Facility Category - Incoming ID:', id);
    console.log('Edit Facility Category - Incoming name:', name);
    const category = await FacilityCategory.findByIdAndUpdate(id, { name }, { new: true });
    if (!category) {
      console.log('Edit Facility Category - Not found for ID:', id);
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    console.error('Edit Facility Category - Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete facility category
exports.deleteFacilityCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await FacilityCategory.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Create a facility
exports.createFacility = async (req, res) => {
  try {
    const { name, location, category, status } = req.body;
    if (!name || !category) return res.status(400).json({ error: 'Name and category required' });
    const facility = await Facility.create({ name, location, category, status });
    const populatedFacility = await Facility.findById(facility._id).populate('category');
    res.status(201).json(populatedFacility);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all facilities
exports.getAllFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find().populate('category');
    res.json(facilities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get one facility by ID
exports.getFacilityById = async (req, res) => {
  try {
    const { id } = req.params;
    const facility = await Facility.findById(id).populate('category');
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
    const facility = await Facility.findByIdAndUpdate(id, update, { new: true }).populate('category');
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

// Get all damage reports for facilities
exports.getAllDamageReports = async (req, res) => {
  try {
    const damaged = await Facility.find({ 'damageReports.0': { $exists: true } })
      .populate('damageReports.student')
      .populate('category');
    const reports = damaged.map(f => ({
      facilityId: f._id,
      facilityName: f.name,
      location: f.location,
      reports: f.damageReports
    }));
    res.json(reports);
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

// Fetch damage reports for a specific student
exports.getStudentDamageReports = async (req, res) => {
  try {
    const { studentId } = req.params;
    // Find all facilities where damageReports contains this student
    const facilities = await Facility.find({ 'damageReports.student': studentId })
      .populate('damageReports.student')
      .populate('category');
    
    // Flatten and filter damageReports for this student
    const reports = [];
    facilities.forEach(f => {
      f.damageReports.forEach(r => {
        if (r.student && r.student._id?.toString() === studentId) {
          reports.push({
            facilityName: f.name,
            location: f.location,
            description: r.description,
            reportedAt: r.reportedAt,
            status: f.status,
            category: f.category, // Return full category object
            repairStatus: r.repairStatus,
            repairUpdate: r.repairUpdate
          });
        }
      });
    });
    res.json(reports);
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