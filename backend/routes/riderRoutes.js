import express from "express";
import bcrypt from "bcrypt";
import Rider from "../models/Rider.js";
import Order from "../models/Order.js";

const router = express.Router();

// â”€â”€ RIDER LOGIN â”€â”€
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    const rider = await Rider.findOne({ phone });
    if (!rider) return res.status(404).json({ error: "Rider not found" });

    const match = await bcrypt.compare(password, rider.password);
    if (!match) return res.status(401).json({ error: "Wrong password" });

    res.json({ success: true, rider });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// â”€â”€ GET RIDER'S ASSIGNED ORDER â”€â”€
router.get("/order/:riderId", async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.riderId).populate("currentOrder");
    if (!rider) return res.status(404).json({ error: "Rider not found" });
    res.json({ order: rider.currentOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// â”€â”€ GET ALL AVAILABLE (UNASSIGNED) ORDERS â”€â”€
router.get("/available-orders", async (req, res) => {
  try {
    const orders = await Order.find({
      status: "confirmed",
      riderId: { $exists: false }
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// â”€â”€ AUTO-ASSIGN ORDER TO NEAREST RIDER â”€â”€
router.post("/auto-assign/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Find a free active rider
    const rider = await Rider.findOne({ isActive: true, currentOrder: null });
    if (!rider) return res.status(404).json({ error: "No riders available" });

    // Assign order to rider
    rider.currentOrder = order._id;
    await rider.save();

    // Update order with rider info
    order.riderId   = rider._id;
    order.riderName = rider.name;
    order.riderPhone = rider.phone;
    order.status    = "assigned";
    await order.save();

    res.json({ success: true, rider, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// â”€â”€ UPDATE ORDER STATUS BY RIDER â”€â”€
router.put("/update-status/:orderId", async (req, res) => {
  try {
    const { status, riderId } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );

    // If delivered, free up the rider
    if (status === "delivered") {
      await Rider.findByIdAndUpdate(riderId, { currentOrder: null });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// â”€â”€ UPDATE RIDER LIVE LOCATION â”€â”€
router.put("/location/:riderId", async (req, res) => {
  try {
    const { lat, lng } = req.body;
    await Rider.findByIdAndUpdate(req.params.riderId, { location: { lat, lng } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/fix-password", async (req, res) => {
  try {
    const hash = await bcrypt.hash("rider123", 10);
    const rider = await Rider.findOneAndUpdate(
      { phone: "+919876543210" },
      { password: hash },
      { new: true }
    );
    res.json({ success: true, rider });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// â”€â”€ GET ALL RIDERS (for admin) â”€â”€
router.get("/all", async (req, res) => {
  try {
    const riders = await Rider.find().populate("currentOrder");
    res.json(riders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/seed", async (req, res) => {
  try {
    const hash = await bcrypt.hash("rider123", 10);
    const rider = await Rider.create({
      name: "Ravi Kumar",
      phone: "+919876543210",
      password: hash,
      isActive: true,
      location: { lat: 21.1702, lng: 72.8311 },
    });
    res.json({ success: true, rider });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/change-password", async (req, res) => {
  try {
    const { phone, newPassword } = req.body;
    
    const hash = await bcrypt.hash(newPassword, 10);
    
    const rider = await Rider.findOneAndUpdate(
      { phone: phone },
      { password: hash },
      { new: true }
    );
    
    if (!rider) return res.status(404).json({ error: "Rider not found" });
    
    res.json({ success: true, message: "Password updated!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
export default router;