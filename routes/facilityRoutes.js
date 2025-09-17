const express = require('express');
const router = express.Router();
const facilityController = require('../controllers/facilityController');


// Facility CRUD
router.post('/facility', facilityController.createFacility);
router.get('/facility', facilityController.getAllFacilities);
router.get('/facility/:id', facilityController.getFacilityById);
router.put('/facility/:id', facilityController.updateFacility);
router.delete('/facility/:id', facilityController.deleteFacility);

// Facility damage report CRUD
router.post('/facility/:id/report-damage', facilityController.reportDamage);
router.get('/facility/:id/damage-reports', facilityController.getFacilityDamageReports);
router.patch('/facility/:facilityId/report/:reportId', facilityController.updateFacilityDamageReport);
router.delete('/facility/:facilityId/report/:reportId', facilityController.deleteFacilityDamageReport);

module.exports = router;