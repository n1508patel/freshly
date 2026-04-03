import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  area: { type: String, required: true },
  location: {
    type: {
      type: String,
      default: "Point"
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  isDefault: { type: Boolean, default: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  mobile: String,
  addresses: [addressSchema],
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("User", userSchema);