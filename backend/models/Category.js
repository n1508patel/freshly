import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: String,
  image: String,
  path: String,
});

export default mongoose.model("Category", categorySchema);
