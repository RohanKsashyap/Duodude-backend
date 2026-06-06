import express from 'express';
import multer from 'multer';
import { uploadImage, deleteImage } from '../controllers/uploadController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Store files in memory so we can pass the buffer directly to ImageKit
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed.'));
    }
  },
});

// POST /api/upload  — upload a single image to ImageKit (admin only)
router.post('/', protect, admin, upload.single('image'), uploadImage);

// DELETE /api/upload  — delete an image from ImageKit by fileId (admin only)
router.delete('/', protect, admin, deleteImage);

export default router;
