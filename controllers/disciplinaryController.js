const DisciplinaryAction = require('../models/DisciplinaryAction.js');

exports.recordAction = async (req, res) => {
  try {
    const action = new DisciplinaryAction(req.body);
    await action.save();
    res.status(201).json({ message: "Disciplinary action recorded", action });
  } catch (error) {
    res.status(400).json({ message: "Error recording action", error: error.message });
  }
};

exports.getActions = async (req, res) => {
  try {
    const actions = await DisciplinaryAction.find()
      .populate("student", "firstName lastName email")
      .populate("staff", "firstName lastName role");
    res.json(actions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching actions", error: error.message });
  }
};

exports.getStudentActions = async (req, res) => {
  try {
    const actions = await DisciplinaryAction.find({ student: req.params.studentId })
      .populate("staff", "firstName lastName role");
    res.json(actions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching student actions", error: error.message });
  }
};
