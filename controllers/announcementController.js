const Announcement = require('../models/Announcement.js');

exports.createAnnouncement = async (req, res) => {
  try {
    const announcement = new Announcement(req.body);
    await announcement.save();
    const populatedAnnouncement = await announcement.populate("createdBy", "firstName lastName role");
    res.status(201).json({ message: "Announcement created", announcement: populatedAnnouncement });
  } catch (error) {
    res.status(400).json({ message: "Error creating announcement", error: error.message });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().populate("createdBy", "firstName lastName role").sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Error fetching announcements", error: error.message });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, audience } = req.body;
    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { title, content, audience },
      { new: true }
    ).populate("createdBy", "firstName lastName role");
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });
    res.json({ message: "Announcement updated successfully", announcement });
  } catch (error) {
    res.status(500).json({ message: "Error updating announcement", error: error.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });
    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting announcement", error: error.message });
  }
};
