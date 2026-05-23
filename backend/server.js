import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import areaRoutes from "./routes/areaRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import addressRoutes from "./routes/address.js";
import aiSearchRoutes from "./routes/aiSearch.js";
import seedRoutes from "./routes/seed.js";
import orderRoutes from "./routes/orderRoutes.js";
import riderRoutes from "./routes/riderRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI,{ writeConcern: { w: 1 } })
  .then(() => {
    console.log(" MongoDB Connected");
    console.log(" Database:", mongoose.connection.name);
  })
  .catch((err) => {
    console.error(" MongoDB connection failed:", err.message);
  });

app.use("/api/seed", seedRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/areas", areaRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/users", userRoutes);
app.use("/api", aiSearchRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/riders", riderRoutes);
app.get("/", (req, res) => {
  res.send(" Grocery Backend Running...");
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
