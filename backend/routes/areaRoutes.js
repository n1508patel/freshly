import express from "express";
import mongoose from "mongoose";
import axios from "axios";

const router = express.Router();

// ===== GET ALL AREAS =====
router.get("/", async (req, res) => {
  try {
    const col = mongoose.connection.db.collection("areas");
    const areas = await col.find({}).toArray();
    console.log("✅ Areas found:", areas.length);
    res.json(areas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== CHECK BY LAT/LNG =====
router.post("/check", async (req, res) => {
  try {
    const { lat, lng } = req.body;
    console.log("📍 Check coords:", lat, lng);
    const col = mongoose.connection.db.collection("areas");

    // First try 2dsphere
    try {
      const area = await col.findOne({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [lng, lat] },
            $maxDistance: 10000,
          },
        },
      });
      if (area) {
        return res.json({ available: area.serviceAvailable, area });
      }
    } catch (e) {
      console.log("2dsphere failed, using fallback");
    }

    // Fallback — return first available area
    const areas = await col.find({}).toArray();
    if (areas.length > 0) {
      const available = areas.find(a => a.serviceAvailable);
      if (available) return res.json({ available: true, area: available });
      return res.json({ available: false, area: areas[0] });
    }
    res.json({ available: false });
  } catch (err) {
    console.error("❌ Check error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ===== SEARCH BY NAME =====
router.get("/search/:name", async (req, res) => {
  try {
    const col = mongoose.connection.db.collection("areas");
    const area = await col.findOne({
      name: { $regex: req.params.name, $options: "i" }
    });
    if (area) {
      res.json({ available: area.serviceAvailable, area });
    } else {
      res.json({ available: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== GPS CHECK =====
router.post("/check-gps", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const col = mongoose.connection.db.collection("areas");

    // Reverse geocode
    try {
      const geoRes = await axios.get("https://nominatim.openstreetmap.org/reverse", {
        params: { format: "json", lat: latitude, lon: longitude },
        headers: { "User-Agent": "freshly-app" }
      });
      const addressData = geoRes.data.address;
      const detectedName = addressData.suburb || addressData.neighbourhood ||
        addressData.village || addressData.town || addressData.city || "Unknown";

      const area = await col.findOne({
        name: { $regex: detectedName, $options: "i" }
      });
      if (area) return res.json({ available: area.serviceAvailable, area });
    } catch (e) {
      console.log("Geocode failed");
    }

    // Fallback
    const areas = await col.find({ serviceAvailable: true }).toArray();
    if (areas.length > 0) return res.json({ available: true, area: areas[0] });
    res.json({ available: false });
  } catch (error) {
    res.status(500).json({ message: "GPS failed" });
  }
});

export default router;