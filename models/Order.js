import mongoose  from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
      size: String
    }
  ],
  total: Number,
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    zip: String,
    country: String
  },
  paymentMethod: String,
  status: { type: String, default: "Pending" }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

export default Order