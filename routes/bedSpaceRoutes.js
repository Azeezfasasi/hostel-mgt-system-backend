const express = require('express');
const { createBedSpace, getBedSpaces, assignStudent, freeBedSpace } = require('../controllers/bedSpaceController.js');
const { auth, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.post("/", createBedSpace);
router.get("/", getBedSpaces);
router.put("/:id/assign", auth, authorizeRoles, assignStudent);
router.put("/:id/free", auth, authorizeRoles, freeBedSpace);

module.exports = router;