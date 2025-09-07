const express = require('express');
const { createAnnouncement, getAnnouncements, deleteAnnouncement } = require('../controllers/announcementController.js');

const router = express.Router();

router.post("/", createAnnouncement);
router.get("/", getAnnouncements);
router.delete("/:id", deleteAnnouncement);

module.exports = router;
