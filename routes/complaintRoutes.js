const express = require('express');
const { createComplaint, getComplaints, updateComplaintStatus, getStudentComplaints, markComplaintResolved }  = require('../controllers/complaintController.js');
const router = express.Router();

// POST /api/complaint
router.post("/", createComplaint);

// GET /api/complaint/student/:studentId
router.get("/student/:studentId", getStudentComplaints);

// PUT /api/complaint/:id/resolve
router.put("/:id/resolve", markComplaintResolved);

// GET /api/complaint
router.get("/", getComplaints);

// PUT /api/complaint/:id
router.put("/:id", updateComplaintStatus);

module.exports = router;
