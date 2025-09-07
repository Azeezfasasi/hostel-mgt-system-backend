const express = require('express');
const { createComplaint, getComplaints, updateComplaintStatus }  = require('../controllers/complaintController.js');

const router = express.Router();

router.post("/", createComplaint);
router.get("/", getComplaints);
router.put("/:id", updateComplaintStatus);

module.exports = router;
