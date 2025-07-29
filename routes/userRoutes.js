import express from 'express'
const router = express.Router();
import {getAllUsers,getProfile,updateProfile,updateUserById,deleteProfile,deleteUserById,getUserById}  from '../controllers/userController.js' ;
import { protect, admin } from '../middleware/authMiddleware.js';

// User routes
router.get('/me', protect,  getProfile);
router.put('/me', protect,  updateProfile);
router.delete('/me', protect,  deleteProfile);

// Admin routes
router.get('/', protect, admin,  getAllUsers);
router.get('/:id', protect, admin,  getUserById);
router.put('/:id', protect, admin,  updateUserById);
router.delete('/:id', protect, admin,  deleteUserById);

export default router;
