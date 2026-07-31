const SessionSummary = require("../models/SessionSummary");
const ProgressReport = require("../models/ProgressReport");
const Appointment = require("../models/Appointment");
const { generateStructured } = require("../ai/aiAdapter");
const { LEVEL_2_SYSTEM } = require("../ai/prompts");

const generateReport = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: "Please provide appointmentId" });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      therapist: req.therapist._id,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const summaries = await SessionSummary.find({
      appointment: appointmentId,
      therapist: req.therapist._id,
      status: "Approved",
    }).sort({ createdAt: 1 });

    if (summaries.length === 0) {
      return res.status(400).json({
        message: "No approved summaries found. Approve a summary first.",
      });
    }

    let combinedSummaries = "";
    const summaryIds = [];

    for (const s of summaries) {
      combinedSummaries += s.summaryText + "\n\n";
      summaryIds.push(s._id);
    }

    const userPrompt =
      "Person: " +
      appointment.name +
      "\n\nApproved session summaries in order:\n\n" +
      combinedSummaries;

    const aiResult = await generateStructured(LEVEL_2_SYSTEM, userPrompt);

    const report = await ProgressReport.create({
      therapist: req.therapist._id,
      appointment: appointmentId,
      summaries: summaryIds,
      reportText: aiResult.reportText,
      overallProgress: aiResult.overallProgress,
      recurringThemes: aiResult.recurringThemes,
      goalProgress: aiResult.goalProgress,
      recommendations: aiResult.recommendations,
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await ProgressReport.find({
      appointment: req.params.appointmentId,
      therapist: req.therapist._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generateReport, getReports };