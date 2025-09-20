const Complaint = require('../models/Complaint.js');

exports.createComplaint = async (req, res) => {
  try {
    const complaint = new Complaint(req.body);
    await complaint.save();
    res.status(201).json({ message: "Complaint submitted successfully", complaint });
  } catch (error) {
    res.status(400).json({ message: "Error submitting complaint", error: error.message });
  }
};

// Get all complaints for a specific student
exports.getStudentComplaints = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const complaints = await Complaint.find({ student: studentId })
      .populate("student", "firstName lastName email")
      .populate("assignedTo", "firstName lastName email");
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Error fetching student complaints", error: error.message });
  }
};
// Mark complaint as resolved/completed
exports.markComplaintResolved = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    complaint.status = "resolved";
    await complaint.save();
    res.json({ message: "Complaint marked as resolved", complaint });
  } catch (error) {
    res.status(400).json({ message: "Error marking complaint as resolved", error: error.message });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("student", "firstName lastName email")
      .populate("assignedTo", "firstName lastName email");
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Error fetching complaints", error: error.message });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.status = req.body.status || complaint.status;
    if (req.body.assignedTo) complaint.assignedTo = req.body.assignedTo;

    await complaint.save();
    res.json({ message: "Complaint updated successfully", complaint });
  } catch (error) {
    res.status(400).json({ message: "Error updating complaint", error: error.message });
  }
};
