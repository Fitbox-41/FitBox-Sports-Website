import express from 'express';
import { protect } from '../MiddleWare/authMiddleware.js';
import Wallet from '../Models/Wallet.js';
import WalletTransaction from '../Models/WalletTransaction.js';

const router = express.Router();

// Get wallet balance and transactions for the logged in user
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    let wallet = await Wallet.findOne({ userId });
    
    if (!wallet) {
      wallet = new Wallet({ userId, balance: 0 });
      await wallet.save();
    }

    const transactions = await WalletTransaction.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      balance: wallet.balance,
      transactions
    });
  } catch (error) {
    console.error('Wallet error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
