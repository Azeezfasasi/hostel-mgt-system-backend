const express = require('express');
const { createMaintenanceRequest, getMaintenanceRequests, updateMaintenanceStatus, getMaintenanceRequest, deleteMaintenanceRequest }  = require('../controllers/maintenanceController');
const { auth, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// POST /api/maintenance
router.post("/", auth, createMaintenanceRequest);

// GET /api/maintenance
router.get("/", auth, authorizeRoles, getMaintenanceRequests);

// GET /api/maintenance/:id
router.get("/:id", auth, authorizeRoles, getMaintenanceRequest);

// PUT /api/maintenance/:id
router.put("/:id", auth, authorizeRoles, updateMaintenanceStatus);

// PATCH /api/maintenance/:id
router.patch("/:id", auth, authorizeRoles, updateMaintenanceStatus);

// DELETE /api/maintenance/:id
router.delete("/:id", auth, authorizeRoles, deleteMaintenanceRequest);

module.exports = router;
