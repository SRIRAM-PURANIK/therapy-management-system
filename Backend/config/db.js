const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error("Error in MongoDB connection:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;