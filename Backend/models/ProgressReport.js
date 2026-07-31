const mongoose = require("mongoose");

const progressReportSchema = new mongoose.Schema(
  {
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    summaries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SessionSummary",
      },
    ],
    reportText: { type: String, required: true, trim: true },
    overallProgress: { type: String, trim: true },
    recurringThemes: [String],
    goalProgress: [String],
    recommendations: [String],
  },
  {
    timestamps: true,
  }
);

const ProgressReport = mongoose.model("ProgressReport", progressReportSchema);

module.exports = ProgressReport;