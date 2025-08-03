import express from "express";
const router = express.Router();
import {
  createReturnRequest,
  getUserReturns,
  getAllReturns,
  updateReturnStatus,
  getReturnById
} from "../controllers/returnController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

// User routes
router.post("/", protect, createReturnRequest);
router.get("/myreturns", protect, getUserReturns);
router.get("/:id", protect, getReturnById);

// Admin routes
router.get("/", protect, admin, getAllReturns);
router.put("/:id/status", protect, admin, updateReturnStatus);

export default router;
