const express = require('express');
const { createBooking, getBookings, updateBookingStatus, cancelBooking }  = require('../controllers/bookingController.js');

const router = express.Router();

router.post("/", createBooking);
router.get("/", getBookings);
router.put("/:id/status", updateBookingStatus);
router.put("/:id/cancel", cancelBooking);

module.exports = router;
