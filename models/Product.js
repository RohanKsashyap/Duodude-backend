import mongoose  from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
  category:String,
  sizes:String,
  colors:String,
  featured:Boolean,
  new:Boolean,
  rating:Number,
  stock: Number
}, { timestamps: true });

const Product= mongoose.model("Product", productSchema);
export default Product