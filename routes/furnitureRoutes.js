const express = require('express');
const router = express.Router();
const furnitureController = require('../controllers/furnitureController');

// Furniture Category
router.post('/furniture-categories', furnitureController.createCategory);
router.get('/furniture-categories', furnitureController.getCategories);
router.put('/furniture-categories/:id', furnitureController.editCategory);
router.delete('/furniture-categories/:id', furnitureController.deleteCategory);

// Furniture CRUD
router.post('/furniture', furnitureController.createFurniture);
router.get('/furniture', furnitureController.getAllFurniture);
router.put('/furniture/:id', furnitureController.editFurniture);
router.delete('/furniture/:id', furnitureController.deleteFurniture);

// Status change
router.patch('/furniture/:id/status', furnitureController.changeStatus);

// Damage report
router.post('/furniture/:id/report-damage', furnitureController.reportDamage);
router.get('/furniture/damage-reports', furnitureController.getAllDamageReports);

module.exports = router;
