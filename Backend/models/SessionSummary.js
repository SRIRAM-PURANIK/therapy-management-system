const mongoose = require("mongoose");

const sessionSummarySchema = new mongoose.Schema(
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
    sessionNotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SessionNote",
      },
    ],
    summaryText: {
      type: String,
      required: true,
      trim: true,
    },
    moodRating: {
      type: Number,
      min: 1,
      max: 10,
    },
    themes: [String],
    goalsDiscussed: [String],
    followUpPoints: [String],
    status: {
      type: String,
      enum: ["Pending", "Approved"],
      default: "Pending",
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const SessionSummary = mongoose.model("SessionSummary", sessionSummarySchema);

module.exports = SessionSummary;