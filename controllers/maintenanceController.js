const MaintenanceRequest = require('../models/MaintenanceRequest.js');

exports.createMaintenanceRequest = async (req, res) => {
  try {
    const request = new MaintenanceRequest(req.body);
    await request.save();
    res.status(201).json({ message: "Maintenance request submitted", request });
  } catch (error) {
    res.status(400).json({ message: "Error creating request", error: error.message });
  }
};

exports.getMaintenanceRequests = async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find()
      .populate("student", "firstName lastName email")
      .populate("room", "roomNumber")
      .populate("assignedStaff", "firstName lastName email");
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching maintenance requests", error: error.message });
  }
};

exports.updateMaintenanceStatus = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = req.body.status || request.status;
    if (req.body.assignedStaff) request.assignedStaff = req.body.assignedStaff;

    await request.save();
    res.json({ message: "Maintenance request updated", request });
  } catch (error) {
    res.status(400).json({ message: "Error updating request", error: error.message });
  }
};
