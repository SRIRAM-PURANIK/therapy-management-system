const express = require("express");
const router = express.Router();

const {
  generateReport,
  getReports,
} = require("../controllers/reportController");

const protect = require("../middleware/authMiddleware");

router.post("/generate", protect, generateReport);
router.get("/appointment/:appointmentId", protect, getReports);

module.exports = router;