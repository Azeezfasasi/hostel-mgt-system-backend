const express = require('express');
const router = express.Router();
const facilityController = require('../controllers/facilityController');

router.post('/facility/:id/report-damage', facilityController.reportDamage);

module.exports = router;