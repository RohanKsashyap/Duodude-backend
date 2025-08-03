import express  from "express";
const router = express.Router();
import {getOrderById,getOrders,getUserOrders,createOrder,updateOrderStatus,deleteOrder, getAnalytics, cancelOrder}  from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

// Admin routes
router.get("/", protect, admin, getOrders);
router.put("/:id/status", protect, admin, updateOrderStatus);
router.delete("/:id", protect, admin, deleteOrder);
router.get('/analytics', protect, admin, getAnalytics);

// User routes
router.get("/myorders", protect, getUserOrders);
router.get("/:id", protect, getOrderById);
router.post("/", protect, createOrder);
router.put("/:id/cancel", protect, cancelOrder);

export default router;
