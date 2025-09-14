const express = require('express');
const { initCredoPayment, confirmPayment, getPayments, verifyCredoPayment }  = require('../controllers/paymentController.js');
// POST - /api/payment/init (Credo direct API)
router.post("/init", initCredoPayment);

// GET - /api/payment/verify (Credo direct API)
router.get("/verify", verifyCredoPayment);

// POST - /api/payment
router.post("/", initiatePayment);

// PUT - /api/payment/:id/confirm
router.put("/:id/confirm", confirmPayment);

// GET - /api/payment
router.get("/", getPayments);

module.exports = router;
