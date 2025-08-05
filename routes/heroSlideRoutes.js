import express from 'express';
import {
  getActiveSlides,
  getAllSlides,
  getSlide,
  createSlide,
  updateSlide,
  deleteSlide,
  toggleSlideStatus,
  reorderSlides
} from '../controllers/heroSlideController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getActiveSlides);
router.get('/:id', getSlide);

// Admin routes
router.get('/admin/all', protect, admin, getAllSlides);
router.post('/admin', protect, admin, createSlide);
router.put('/admin/:id', protect, admin, updateSlide);
router.delete('/admin/:id', protect, admin, deleteSlide);
router.patch('/admin/:id/toggle', protect, admin, toggleSlideStatus);
router.patch('/admin/reorder', protect, admin, reorderSlides);

export default router;
