const Therapist = require("../models/Therapist");
const generateToken = require("../utils/generateToken");



//register controller
const registerTherapist = async (req, res) => {
  try {
    const { name, email, password, specialization } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide name, email and password" });
    }

    const existingTherapist = await Therapist.findOne({ email });

    if (existingTherapist) {
      return res
        .status(409)
        .json({ message: "A therapist with this email already exists" });
    }

    const therapist = await Therapist.create({
      name,
      email,
      password,
      specialization,
    });

    res.status(201).json({
      _id: therapist._id,
      name: therapist.name,
      email: therapist.email,
      specialization: therapist.specialization,
      token: generateToken(therapist._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




//login controller 
const loginTherapist = async (req,res)=>{
  try{
    const {email,password} = req.body;


    if(!email || !password){

      return res
      .status(400)
      .json({message:"Please provide email and password"});
    }

    const therapist = await Therapist.findOne({email});

    if(!therapist){
      return status(401).json({message: "Invalid email ID or password!"});
    }

    const Match = await therapist.matchPassword(password);

    if(!Match){
      return status(401).json({message: "Invalid email ID or password!"});
    }

    res.status(200).json({
      _id: therapist._id,
      name: therapist.name,
      email: therapist.email,
      specialization: therapist.specialization,
      token: generateToken(therapist._id),
    });
  }
  catch(err){
    res.status(500).json({message: err.message});
  }
}

const getMe = async (req,res) =>{
  res.status(200).json(req.therapist);
}

module.exports = { registerTherapist,
                   loginTherapist,
                   getMe
};