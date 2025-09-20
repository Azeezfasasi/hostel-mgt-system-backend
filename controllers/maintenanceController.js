const MaintenanceRequest = require('../models/MaintenanceRequest.js');


exports.createMaintenanceRequest = async (req, res) => {
  try {
    // Basic validation
    if (!req.body.student || !req.body.room || !req.body.description) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const request = new MaintenanceRequest(req.body);
    await request.save();
    res.status(201).json({ message: "Maintenance request submitted", request });
  } catch (error) {
    res.status(400).json({ message: "Error creating request", error: error.message });
  }
};


// Get all maintenance requests, with optional filters
exports.getMaintenanceRequests = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.student) filter.student = req.query.student;
    if (req.query.room) filter.room = req.query.room;
    const requests = await MaintenanceRequest.find(filter)
      .populate("student", "firstName lastName email")
      .populate("room", "roomNumber")
      .populate("assignedStaff", "firstName lastName email");
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching maintenance requests", error: error.message });
  }
};

// Get a single maintenance request
exports.getMaintenanceRequest = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id)
      .populate("student", "firstName lastName email")
      .populate("room", "roomNumber")
      .populate("assignedStaff", "firstName lastName email");
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Error fetching request", error: error.message });
  }
};


// Update maintenance request status or details
exports.updateMaintenanceStatus = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Allow updating status, assignedStaff, description, etc.
    if (req.body.status) request.status = req.body.status;
    if (req.body.assignedStaff) request.assignedStaff = req.body.assignedStaff;
    if (req.body.description) request.description = req.body.description;

    await request.save();
    res.json({ message: "Maintenance request updated", request });
  } catch (error) {
    res.status(400).json({ message: "Error updating request", error: error.message });
  }
};

// Delete maintenance request
exports.deleteMaintenanceRequest = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json({ message: "Maintenance request deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting request", error: error.message });
  }
};
