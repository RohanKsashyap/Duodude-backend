import express from "express";
import {
  getProducts,
  addProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all products
router.get("/", getProducts);

// Get featured products
router.get("/featured", getFeaturedProducts);

// Get product by ID
router.get("/:id", getProductById);

// Add a new product
router.post("/", protect, admin, addProduct);

// Update a product by ID
router.put("/:id", protect, admin, updateProduct);

// Delete a product by ID
router.delete("/:id", protect, admin, deleteProduct);

export default router;
