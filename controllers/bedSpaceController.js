const BedSpace = require('../models/BedSpace.js');

exports.createBedSpace = async (req, res) => {
  try {
    const bed = new BedSpace(req.body);
    await bed.save();
    res.status(201).json({ message: "Bed space created successfully", bed });
  } catch (error) {
    res.status(400).json({ message: "Error creating bed space", error: error.message });
  }
};

exports.getBedSpaces = async (req, res) => {
  try {
    const beds = await BedSpace.find().populate("room student");
    res.json(beds);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bed spaces", error: error.message });
  }
};

exports.assignStudent = async (req, res) => {
  try {
    const bed = await BedSpace.findById(req.params.id);
    if (!bed) return res.status(404).json({ message: "Bed space not found" });
    if (!bed.isAvailable) return res.status(400).json({ message: "Bed space already occupied" });

    bed.student = req.body.studentId;
    bed.isAvailable = false;
    await bed.save();

    res.json({ message: "Student assigned to bed space", bed });
  } catch (error) {
    res.status(400).json({ message: "Error assigning student", error: error.message });
  }
};

exports.freeBedSpace = async (req, res) => {
  try {
    const bed = await BedSpace.findById(req.params.id);
    if (!bed) return res.status(404).json({ message: "Bed space not found" });

    bed.student = null;
    bed.isAvailable = true;
    await bed.save();

    res.json({ message: "Bed space is now available", bed });
  } catch (error) {
    res.status(500).json({ message: "Error freeing bed space", error: error.message });
  }
};
