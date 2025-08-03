import mongoose from "mongoose";

const returnSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
      size: String,
      reason: String
    }
  ],
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected", "processing", "completed"], 
    default: "pending" 
  },
  refundAmount: Number,
  adminNotes: String,
  images: [String], // For return proof images
  returnPeriodExpiry: Date
}, { timestamps: true });

const Return = mongoose.model("Return", returnSchema);
export default Return;
