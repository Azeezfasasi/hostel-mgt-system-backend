const express = require('express');
const { initiatePayment, confirmPayment, getPayments }  = require('../controllers/paymentController.js');

const router = express.Router();

router.post("/", initiatePayment);
router.put("/:id/confirm", confirmPayment);
router.get("/", getPayments);

module.exports = router;
