const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ["Paystack", "Flutterwave", "Stripe", "Cash"], required: true },
  status: { type: String, enum: ["success", "failed", "pending", "refunded"], default: "pending" },
  transactionReference: { type: String, unique: true },
  invoiceUrl: String
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
