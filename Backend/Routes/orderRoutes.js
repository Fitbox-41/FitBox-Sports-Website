import express from 'express';
import { placeOrder, mockPayment, getUserOrders, cancelOrder, codPayment, phonePeInitiate, phonePeCallback, phonePeRedirect } from '../Controllers/orderController.js';
import { protect } from '../MiddleWare/authMiddleware.js';

const router = express.Router();

router.post('/place', protect, placeOrder); 
router.post('/mock-payment', protect, mockPayment);
router.post('/phonepe/initiate', protect, phonePeInitiate);
router.post('/phonepe/callback', phonePeCallback);
router.all('/phonepe/redirect', phonePeRedirect);
router.get('/myorders', protect, getUserOrders);
router.delete('/:id/cancel', protect, cancelOrder);
router.post('/cod-payment', protect, codPayment);

export default router;
