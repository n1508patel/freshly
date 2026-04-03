import express from "express";
import User from "../models/User.js";

const router = express.Router();


// ===============================
// ✅ GET PROFILE
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(404).json({ message: "User not found" });
  }
});


// ===============================
// ✅ UPDATE PROFILE
// ===============================
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name
      },
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
});


// ===============================
// 🔥 SAVE GPS LOCATION
// ===============================
router.post("/save-location", async (req, res) => {
  try {

    const { userId, latitude, longitude, areaName } = req.body;

    // 🔥 Step 1: Make all old addresses isDefault = false
    await User.findByIdAndUpdate(userId, {
      $set: { "addresses.$[].isDefault": false }
    });

    // 🔥 Step 2: Push new GPS address
    await User.findByIdAndUpdate(userId, {
      $push: {
        addresses: {
          area: areaName,
          location: {
            type: "Point",
            coordinates: [longitude, latitude] // order important
          },
          isDefault: true
        }
      }
    });

    res.json({ success: true, message: "Location saved successfully" });

  } catch (error) {
    res.status(500).json({ error: "Location save error" });
  }
});


export default router;