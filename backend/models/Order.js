import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderNo:     { type: String, required: true },
  user:        { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name:        String,
  phone:       String,
  email:       String,
  address:     String,
  city:        String,
  pincode:     String,
  payMethod:   String,
  total:       Number,
  items:       Array,
  status:      { type: String, default: "confirmed" },
  riderId:    { type: mongoose.Schema.Types.ObjectId, ref: "Rider", default: null },
riderName:  { type: String, default: null },
riderPhone: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);