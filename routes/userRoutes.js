import express from 'express'
const router = express.Router();
import {getAllUsers,getProfile,updateProfile,updateUserById,deleteProfile,deleteUserById,getUserById,addAddress,updateAddress,deleteAddress}  from '../controllers/userController.js' ;
import { protect, admin } from '../middleware/authMiddleware.js';

// User routes
router.get('/me', protect,  getProfile);
router.put('/me', protect,  updateProfile);
router.delete('/me', protect,  deleteProfile);

// Address routes
router.post('/me/addresses', protect, addAddress);
router.put('/me/addresses/:addressId', protect, updateAddress);
router.delete('/me/addresses/:addressId', protect, deleteAddress);

// Admin routes
router.get('/', protect, admin,  getAllUsers);
router.get('/:id', protect, admin,  getUserById);
router.put('/:id', protect, admin,  updateUserById);
router.delete('/:id', protect, admin,  deleteUserById);

export default router;
