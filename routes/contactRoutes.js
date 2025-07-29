import express from "express";
const router = express.Router();
import {getMessageById,getMessages,deleteMessage,sendMessage}  from "../controllers/contactController.js"
import { protect, admin }  from "../middleware/authMiddleware.js"

// Public route: send message
router.post("/",  sendMessage);

// Admin routes: manage messages
router.get("/", protect, admin,  getMessages);
router.get("/:id", protect, admin,  getMessageById);
router.delete("/:id", protect, admin,  deleteMessage);

export  default router;
