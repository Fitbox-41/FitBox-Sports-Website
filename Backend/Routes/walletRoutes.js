import express from 'express';
import { protect } from '../MiddleWare/authMiddleware.js';
import User from '../Models/User.js';
import WalletTransaction from '../Models/WalletTransaction.js';

const router = express.Router();

// Get wallet balance (from the user doc) and transactions (from the ledger)
// for the logged in user.
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('walletBalance');
    const balance = user && user.walletBalance ? user.walletBalance : 0;

    const transactions = await WalletTransaction.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      balance,
      transactions
    });
  } catch (error) {
    console.error('Wallet error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
