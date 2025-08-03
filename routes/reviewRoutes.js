import express from "express";
import { createReview, getProductReviews, updateReview, deleteReview } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all reviews for a product
router.get("/product/:productId", getProductReviews);

// Create a review (authenticated)
router.post("/", protect, createReview);

// Update a review (authenticated)
router.put("/:id", protect, updateReview);

// Delete a review (authenticated)
router.delete("/:id", protect, deleteReview);

export default router; 