const express = require("express");
const router = express.Router();

const {
  generateSummary,
  getSummaries,
  approveSummary,
} = require("../controllers/summaryController");

const protect = require("../middleware/authMiddleware");

router.post("/generate", protect, generateSummary);
router.get("/appointment/:appointmentId", protect, getSummaries);
router.patch("/:id/approve", protect, approveSummary);

module.exports = router;