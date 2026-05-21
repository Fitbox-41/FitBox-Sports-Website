import express from 'express';
import { 
  registerUser, 
  loginUser, 
  googleLogin,
  getUserProfile, 
  syncData 
} from '../Controllers/authController.js';
import { protect } from '../MiddleWare/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/profile', protect, getUserProfile);
router.put('/sync', protect, syncData);

export default router;
