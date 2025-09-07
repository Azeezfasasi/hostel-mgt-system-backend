const express = require('express');
const { createMaintenanceRequest, getMaintenanceRequests, updateMaintenanceStatus }  = require('../controllers/maintenanceController');

const router = express.Router();

router.post("/", createMaintenanceRequest);
router.get("/", getMaintenanceRequests);
router.put("/:id", updateMaintenanceStatus);

module.exports = router;
