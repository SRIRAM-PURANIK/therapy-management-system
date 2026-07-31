const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
} = require('../controllers/appointmentController');


const protect = require("../middleware/authMiddleware");

router.post("/", protect, createAppointment);
router.get("/", protect, getAppointments);
router.get("/:id", protect, getAppointmentById);

module.exports = router;