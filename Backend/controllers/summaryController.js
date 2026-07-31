const SessionNote = require("../models/SessionNote");
const SessionSummary = require("../models/SessionSummary");
const Appointment = require("../models/Appointment");
const { generateStructured } = require("../ai/aiAdapter");
const { LEVEL_1_SYSTEM } = require("../ai/prompts");

const generateSummary = async (req, res) => {
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

    const notes = await SessionNote.find({
      appointment: appointmentId,
      therapist: req.therapist._id,
      isSummarized: false,
    }).sort({ sessionDate: 1 });

    if (notes.length === 0) {
      return res
        .status(400)
        .json({ message: "No unsummarised notes found for this appointment" });
    }

    let combinedNotes = "";
    const noteIds = [];

    for (const note of notes) {
      combinedNotes += note.content + "\n\n";
      noteIds.push(note._id);
    }

    const userPrompt =
      "Person: " + appointment.name + "\n\nSession notes:\n\n" + combinedNotes;

    const aiResult = await generateStructured(LEVEL_1_SYSTEM, userPrompt);

    const summary = await SessionSummary.create({
      therapist: req.therapist._id,
      appointment: appointmentId,
      sessionNotes: noteIds,
      summaryText: aiResult.summaryText,
      moodRating: aiResult.moodRating,
      themes: aiResult.themes,
      goalsDiscussed: aiResult.goalsDiscussed,
      followUpPoints: aiResult.followUpPoints,
    });

    await SessionNote.updateMany(
      { _id: { $in: noteIds } },
      { isSummarized: true }
    );

    res.status(201).json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSummaries = async (req, res) => {
  try {
    const summaries = await SessionSummary.find({
      appointment: req.params.appointmentId,
      therapist: req.therapist._id,
    }).sort({ createdAt: 1 });

    res.status(200).json(summaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveSummary = async (req, res) => {
  try {
    const summary = await SessionSummary.findOne({
      _id: req.params.id,
      therapist: req.therapist._id,
    });

    if (!summary) {
      return res.status(404).json({ message: "Summary not found" });
    }

    summary.status = "Approved";
    summary.approvedAt = Date.now();
    await summary.save();

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generateSummary, getSummaries, approveSummary };