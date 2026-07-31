const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const noteRoutes = require("./routes/noteRoutes");
const summaryRoutes = require("./routes/summaryRoutes");
const reportRoutes = require("./routes/reportRoutes");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());


//Routes used 
app.get("/", (req, res) => {
  res.json({ message: "Therapy Management API is running" });
});

//common route word used before custom route
app.use("/api", authRoutes);

//appointments api route
app.use("/api/appointments", appointmentRoutes)

//Note api route
app.use("/api/notes", noteRoutes);

//Summary api route
app.use("/api/summaries", summaryRoutes);

//Reports of summary api 
app.use("/api/reports", reportRoutes);


//Port on which server is running 
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});