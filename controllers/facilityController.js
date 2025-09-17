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