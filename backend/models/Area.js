import mongoose from "mongoose";

const areaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, default: "Bardoli" },
  serviceAvailable: { type: Boolean, default: true },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },

  radius: {
    type: Number,
    default: 5000
  }

}, { timestamps: true });

areaSchema.index({ location: "2dsphere" });

export default mongoose.model("Area", areaSchema);