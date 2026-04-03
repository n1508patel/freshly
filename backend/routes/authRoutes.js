import express from "express";
import User from "../models/User.js";
import { register } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { mobile } = req.body;

    let user = await User.findOne({ mobile });

    if (!user) {
      user = await User.create({
        mobile,
        name:"",
        email: "",
        password: "",
        isVerified: true
      });
    }

    res.json(user);

  } catch (err){
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/register", register);

export default router;