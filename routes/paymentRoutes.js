const express = require('express');
const { initiatePayment, confirmPayment, getPayments }  = require('../controllers/paymentController.js');

const router = express.Router();

// POST - /api/payment
router.post("/", initiatePayment);

// PUT - /api/payment/:id/confirm
router.put("/:id/confirm", confirmPayment);

// GET - /api/payment
router.get("/", getPayments);

module.exports = router;
