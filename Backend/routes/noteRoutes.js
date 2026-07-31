const express = require("express");
const router = express.Router();

const {
  createNote,
  getNotesByAppointment,
} = require("../controllers/noteController");

const protect = require("../middleware/authMiddleware");

router.post("/", protect, createNote);
router.get("/appointment/:appointmentId", protect, getNotesByAppointment);

module.exports = router;