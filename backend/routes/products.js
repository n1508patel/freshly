import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

/* =========================
   GET ALL PRODUCTS
========================= */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   GET PRODUCTS BY SECTION
   /api/products/section/bestSeller
========================= */
router.get("/section/:section", async (req, res) => {
  try {
    const products = await Product.find({
      section: req.params.section
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;