import express from 'express';
import { placeOrder, mockPayment, getUserOrders, getOrderById, cancelOrder, codPayment, phonePeInitiate, phonePeCallback, phonePeRedirect, verifyOrderPayment, trackOrder } from '../Controllers/orderController.js';
import { protect } from '../MiddleWare/authMiddleware.js';

const router = express.Router();

router.post('/place', protect, placeOrder); 
router.post('/mock-payment', protect, mockPayment);
router.post('/phonepe/initiate', protect, phonePeInitiate);
router.post('/phonepe/callback', phonePeCallback);
router.all('/phonepe/redirect', phonePeRedirect);
router.get('/myorders', protect, getUserOrders);
router.get('/:id/track', protect, trackOrder);
router.get('/:id', protect, getOrderById);
router.post('/:id/verify-payment', protect, verifyOrderPayment);
router.delete('/:id/cancel', protect, cancelOrder);
router.post('/:id/cancel', protect, cancelOrder);
router.post('/cod-payment', protect, codPayment);

export default router;
