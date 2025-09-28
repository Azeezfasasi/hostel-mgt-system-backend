const express = require('express');
const router = express.Router();
const facilityController = require('../controllers/facilityController');

// Debug: Get a single facility category by ID
router.get('/facility-categories/:id', async (req, res) => {
	const FacilityCategory = require('../models/FacilityCategory');
	try {
		const category = await FacilityCategory.findById(req.params.id);
		if (!category) return res.status(404).json({ error: 'Category not found' });
		res.json(category);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Facility Category CRUD 
// Post - /facility/facility-categories
router.post('/facility-categories', facilityController.createFacilityCategory);

// GET - facility/facility-categories
router.get('/facility-categories', facilityController.getFacilityCategories);

// PUT - facility/facility-categories/:id
router.put('/facility-categories/:id', facilityController.editFacilityCategory);

// DELETE - facility/facility-categories/:id
router.delete('/facility-categories/:id', facilityController.deleteFacilityCategory);



// Facility CRUD
// POST - facility/facility
router.post('/facility', facilityController.createFacility);

// GET - facility/facility
router.get('/facility', facilityController.getAllFacilities);

// GET - facility/facility/:id
router.get('/facility/:id', facilityController.getFacilityById);

// PUT - facility/facility/:id
router.put('/facility/:id', facilityController.updateFacility);

// DELETE - facility/facility/:id
router.delete('/facility/:id', facilityController.deleteFacility);



// Facility damage report CRUD
// POST - facility/facility/:id/report-damage
router.post('/facility/:id/report-damage', facilityController.reportDamage);

// GET - facility/facility/:id/damage-reports
router.get('/facility/:id/damage-reports', facilityController.getFacilityDamageReports);

// PATCH - facility/facility/:facilityId/report/:reportId
router.patch('/facility/:facilityId/report/:reportId', facilityController.updateFacilityDamageReport);

// DELETE - facility/facility/:facilityId/report/:reportId
router.delete('/facility/:facilityId/report/:reportId', facilityController.deleteFacilityDamageReport);

module.exports = router;