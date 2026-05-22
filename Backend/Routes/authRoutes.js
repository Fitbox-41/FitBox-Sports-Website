import express from 'express';
import { 
  registerUser, 
  loginUser, 
  googleLogin,
  getUserProfile, 
  updateProfile,
  deleteAccount,
  syncData 
} from '../Controllers/authController.js';
import { protect } from '../MiddleWare/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfile);
router.delete('/profile', protect, deleteAccount);
router.put('/sync', protect, syncData);

export default router;
