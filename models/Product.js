import mongoose  from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  images: [String], // Changed from single image to array of images
  category: String,
  sizes: String,
  colors: String,
  featured: Boolean,
  new: Boolean,
  rating: Number,
  stock: Number,
  returnAvailable: { type: Boolean, default: false },
  returnPeriodDays: { type: Number, default: 0 }
}, { timestamps: true });

const Product= mongoose.model("Product", productSchema);
export default Product