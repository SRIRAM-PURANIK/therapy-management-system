const SessionNote = require("../models/SessionNote");
const Appointment = require("../models/Appointment");

const createNote = async (req, res) => {
  try {
    const { appointmentId, content, sessionDate } = req.body;

    if (!appointmentId || !content) {
      return res
        .status(400)
        .json({ message: "Please provide appointmentId and content" });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      therapist: req.therapist._id,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const note = await SessionNote.create({
      therapist: req.therapist._id,
      appointment: appointmentId,
      content,
      sessionDate,
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNotesByAppointment = async (req, res) => {
  try {
    const notes = await SessionNote.find({
      appointment: req.params.appointmentId,
      therapist: req.therapist._id,
    }).sort({ sessionDate: 1 });

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createNote, getNotesByAppointment };