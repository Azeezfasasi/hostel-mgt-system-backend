const express = require('express');
const { createNotification, getUserNotifications, markAsRead }  = require('../controllers/notificationController.js');

const router = express.Router();

router.post("/", createNotification);
router.get("/:userId", getUserNotifications);
router.put("/:id/read", markAsRead);

module.exports = router;
