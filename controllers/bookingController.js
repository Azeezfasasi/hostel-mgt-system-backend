const Booking = require('../models/Booking.js');
const BedSpace = require('../models/BedSpace.js');

exports.createBooking = async (req, res) => {
  try {
    const { student, bedSpace } = req.body;

    // Check if bed space exists and is available
    const bed = await BedSpace.findById(bedSpace);
    if (!bed) return res.status(404).json({ message: "Bed space not found" });
    if (!bed.isAvailable) return res.status(400).json({ message: "Bed space already occupied" });

    // Create booking
    const booking = new Booking(req.body);
    await booking.save();

    // Reserve bed space
    bed.isAvailable = false;
    bed.student = student;
    await bed.save();

    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (error) {
    res.status(400).json({ message: "Error creating booking", error: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("student")
      .populate({ path: "bedSpace", populate: { path: "room" } });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = req.body.status || booking.status;
    await booking.save();

    res.json({ message: "Booking status updated", booking });
  } catch (error) {
    res.status(400).json({ message: "Error updating booking", error: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Free the bed space
    const bed = await BedSpace.findById(booking.bedSpace);
    if (bed) {
      bed.isAvailable = true;
      bed.student = null;
      await bed.save();
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling booking", error: error.message });
  }
};
