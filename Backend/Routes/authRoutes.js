import express from 'express';
import { 
  registerUser, 
  loginUser, 
  preRegister,
  preLogin,
  googleLogin,
  getUserProfile, 
  updateProfile,
  deleteAccount,
  syncData,
  requestPasswordResetOtp,
  verifyResetOtp,
  updatePassword
} from '../Controllers/authController.js';
import { protect } from '../MiddleWare/authMiddleware.js';

const router = express.Router();

router.post('/pre-register', preRegister);
router.post('/pre-login', preLogin);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/forgot-password-otp', requestPasswordResetOtp);
router.post('/verify-reset-otp', verifyResetOtp);
router.put('/password', protect, updatePassword);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfile);
router.delete('/profile', protect, deleteAccount);
router.put('/sync', protect, syncData);

export default router;
