const { Furniture, FurnitureCategory } = require('../models/Furniture');
const User = require('../models/User'); // Assuming User model exists

// Create furniture category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const category = await FurnitureCategory.create({ name });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await FurnitureCategory.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create furniture
exports.createFurniture = async (req, res) => {
  try {
    const { name, category, quantity, location, condition, status } = req.body;
    if (!name || !category) return res.status(400).json({ error: 'Name and category required' });
    const furniture = await Furniture.create({ name, category, quantity, location, condition, status });
    res.status(201).json(furniture);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch all furniture
exports.getAllFurniture = async (req, res) => {
  try {
    const furniture = await Furniture.find().populate('category');
    res.json(furniture);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit furniture
exports.editFurniture = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const furniture = await Furniture.findByIdAndUpdate(id, update, { new: true });
    if (!furniture) return res.status(404).json({ error: 'Furniture not found' });
    res.json(furniture);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete furniture
exports.deleteFurniture = async (req, res) => {
  try {
    const { id } = req.params;
    const furniture = await Furniture.findByIdAndDelete(id);
    if (!furniture) return res.status(404).json({ error: 'Furniture not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Change furniture status
exports.changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const furniture = await Furniture.findByIdAndUpdate(id, { status }, { new: true });
    if (!furniture) return res.status(404).json({ error: 'Furniture not found' });
    res.json(furniture);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Report damage (by students)
exports.reportDamage = async (req, res) => {
  try {
    const { id } = req.params;
    const { student, description } = req.body;
    if (!student || !description) return res.status(400).json({ error: 'Student and description required' });
    const furniture = await Furniture.findById(id);
    if (!furniture) return res.status(404).json({ error: 'Furniture not found' });
    furniture.damageReports.push({ student, description });
    furniture.status = 'damage';
    await furniture.save();
    res.json(furniture);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch all damage reports
exports.getAllDamageReports = async (req, res) => {
  try {
    const damaged = await Furniture.find({ 'damageReports.0': { $exists: true } }).populate('damageReports.student');
    const reports = damaged.map(f => ({
      furnitureId: f._id,
      furnitureName: f.name,
      location: f.location,
      reports: f.damageReports
    }));
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
