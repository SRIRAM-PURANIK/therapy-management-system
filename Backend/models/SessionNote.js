const mongoose = require("mongoose");

const sessionNoteSchema = new mongoose.Schema(
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
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
    },
    sessionDate: {
      type: Date,
      default: Date.now,
    },
    isSummarized: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const SessionNote = mongoose.model("SessionNote", sessionNoteSchema);

module.exports = SessionNote;