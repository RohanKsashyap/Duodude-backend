import express from 'express';
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  updateCartQuantity
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // protect all cart routes

router.get('/', getCart);
router.post('/add', addToCart);
router.delete('/remove', removeFromCart);
router.delete('/clear', clearCart);
router.put('/:productId/quantity', updateCartQuantity);

export default router;
