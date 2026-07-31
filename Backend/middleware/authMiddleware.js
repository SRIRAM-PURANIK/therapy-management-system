const jwt = require("jsonwebtoken");
const Therapist = require("../models/Therapist");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorised, no token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const therapist = await Therapist.findById(decoded.id).select("-password");

    if (!therapist) {
      return res.status(401).json({ message: "Therapist no longer exists" });
    }

    req.therapist = therapist;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorised, token failed" });
  }
};

module.exports = protect;