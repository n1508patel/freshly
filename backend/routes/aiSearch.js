import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import Groq from "groq-sdk";

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Get related products from same category ──────────────────────────────────
async function getRelatedProductNames(query, foundProducts, col) {
  // Get categories from found products
  const categories = [...new Set(foundProducts.map((p) => p.category).filter(Boolean))];

  let relatedProducts = [];

  if (categories.length > 0) {
    // Find other products in same categories
    relatedProducts = await col
      .find({
        category: { $in: categories },
        name: { $nin: foundProducts.map((p) => p.name) }, // exclude already found
      })
      .limit(10)
      .toArray();
  }

  // If not enough, get products with similar name keywords
  if (relatedProducts.length < 3) {
    const words = query.trim().split(" ");
    const wordRegexes = words.map((w) => new RegExp(w, "i"));
    const extraProducts = await col
      .find({
        $or: wordRegexes.flatMap((r) => [{ name: r }, { category: r }, { brand: r }]),
        name: { $nin: [...foundProducts.map((p) => p.name), ...relatedProducts.map((p) => p.name)] },
      })
      .limit(5)
      .toArray();
    relatedProducts = [...relatedProducts, ...extraProducts];
  }

  return relatedProducts.slice(0, 5).map((p) => p.name).filter(Boolean);
}

// ─── Groq AI: Generate friendly message only ─────────────────────────────────
async function getAIMessage(query, foundCount) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 100,
    messages: [
      {
        role: "user",
        content: `User searched for "${query}" in a grocery store and found ${foundCount} products.
Write a short friendly 1-sentence message about the results.
Respond with ONLY the message string, no JSON, no quotes.`,
      },
    ],
  });
  return response.choices[0].message.content.trim();
}

// ─── POST /api/search ─────────────────────────────────────────────────────────
router.post("/search", async (req, res) => {
  try {
    const { query } = req.body;
    console.log(" Search query:", query);

    const col = mongoose.connection.db.collection("products");

    // Empty query → return first 20 products
    if (!query || !query.trim()) {
      const products = await col.find({}).limit(20).toArray();
      return res.json({
        products,
        ai: { message: "Showing all available products.", suggestions: [] },
      });
    }

    // Step 1: Search MongoDB for matching products
    const searchRegex = new RegExp(query.trim(), "i");
    const products = await col
      .find({
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { category: searchRegex },
          { brand: searchRegex },
          { tags: { $in: [searchRegex] } },
        ],
      })
      .toArray();

    console.log(" Products found:", products.length);

    // Step 2: Get real suggestions from actual store products
    const suggestions = await getRelatedProductNames(query.trim(), products, col);
    console.log(" Real suggestions:", suggestions);

    // Step 3: Get friendly AI message
    let message = `Found ${products.length} result(s) for "${query}".`;
    try {
      message = await getAIMessage(query.trim(), products.length);
      console.log(" AI message:", message);
    } catch (aiErr) {
      console.warn("⚠️ Groq AI failed:", aiErr.message);
    }

    // Step 4: Return everything
    res.json({
      products,
      totalFound: products.length,
      ai: {
        message,
        suggestions, // ✅ Only real products from your store
      },
    });
  } catch (err) {
    console.error(" Search error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;