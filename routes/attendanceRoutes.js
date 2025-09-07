const express = require('express');
const { checkIn, checkOut, getAttendanceRecords } = require('../controllers/attendanceController.js');

const router = express.Router();

router.post("/check-in", checkIn);
router.post("/check-out", checkOut);
router.get("/", getAttendanceRecords);

module.exports = router;
