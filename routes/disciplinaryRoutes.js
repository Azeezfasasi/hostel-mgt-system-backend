const express = require('express');
const { recordAction, getActions, getStudentActions }  = require('../controllers/disciplinaryController.js');

const router = express.Router();

router.post("/", recordAction);
router.get("/", getActions);
router.get("/student/:studentId", getStudentActions);

module.exports = router;
