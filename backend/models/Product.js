import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  old: Number,
  discount: String,
  rating: Number,
  category: String,
  availability: String,
  brand: String,
  tags: [String],
  specs: [
    {
      label: String,
      value: String
    }
  ],
  description: String,
  imgs: [String]
}, { timestamps: true });

export default mongoose.model("Product", productSchema, "products");