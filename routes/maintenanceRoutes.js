const express = require('express');
const { createMaintenanceRequest, getMaintenanceRequests, updateMaintenanceStatus, getMaintenanceRequest, deleteMaintenanceRequest }  = require('../controllers/maintenanceController');

const router = express.Router();

// POST /api/maintenance
router.post("/", createMaintenanceRequest);

// GET /api/maintenance
router.get("/", getMaintenanceRequests);

// GET /api/maintenance/:id
router.get("/:id", getMaintenanceRequest);

// PUT /api/maintenance/:id
router.put("/:id", updateMaintenanceStatus);

// PATCH /api/maintenance/:id
router.patch("/:id", updateMaintenanceStatus);

// DELETE /api/maintenance/:id
router.delete("/:id", deleteMaintenanceRequest);

module.exports = router;
