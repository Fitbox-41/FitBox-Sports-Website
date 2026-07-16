import express from 'express';
import multer from 'multer';
import { getAllProducts, getProductById, addProductReview, deleteProductReview, markReviewHelpful } from '../Controllers/productController.js';
import { protect } from '../MiddleWare/authMiddleware.js';

const router = express.Router();

// Multer in-memory storage for handling images validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max limit per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const uploadMiddleware = (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/:id/reviews', protect, uploadMiddleware, addProductReview);
router.delete('/:id/reviews/:reviewId', protect, deleteProductReview);
router.post('/:id/reviews/:reviewId/helpful', protect, markReviewHelpful);

export default router;



