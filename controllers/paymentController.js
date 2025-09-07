const Payment = require('../models/Payment.js');
const Booking = require('../models/Booking.js');

exports.initiatePayment = async (req, res) => {
  try {
    const { bookingId, student, amount, method } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const payment = new Payment({
      booking: bookingId,
      student,
      amount,
      method,
      status: "pending",
      transactionReference: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    });

    await payment.save();
    res.status(201).json({ message: "Payment initiated", payment });
  } catch (error) {
    res.status(400).json({ message: "Error initiating payment", error: error.message });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    payment.status = req.body.status || "success";
    await payment.save();

    if (payment.status === "success") {
      await Booking.findByIdAndUpdate(payment.booking, { status: "confirmed" });
    }

    res.json({ message: "Payment updated successfully", payment });
  } catch (error) {
    res.status(400).json({ message: "Error updating payment", error: error.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("booking student");
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error: error.message });
  }
};
