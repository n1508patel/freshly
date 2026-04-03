import express from "express";
import User from "../models/User.js";

const router = express.Router();

// ➕ Add new address
router.post("/:userId", async (req,res) => {
  const user = await User.findById(req.params.userId);
  user.addresses.push(req.body);
  await user.save();
  res.json(user.addresses);
});

// 📥 Get all addresses
router.get("/:userId", async (req,res) => {
  const user = await User.findById(req.params.userId);
  res.json(user.addresses);
});

// ❌ Delete address
router.delete("/:userId/:index", async (req,res) => {
  const user = await User.findById(req.params.userId);
  user.addresses.splice(req.params.index,1);
  await user.save();
  res.json(user.addresses);
});

export default router;