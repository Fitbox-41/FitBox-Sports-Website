import express from 'express';
import { placeOrder, gokwikWebhook, mockPayment, getUserOrders } from '../Controllers/orderController.js';
import { protect } from '../MiddleWare/authMiddleware.js';

const router = express.Router();

router.post('/place', protect, placeOrder); 
router.post('/webhook/gokwik', gokwikWebhook); 
router.post('/mock-payment', protect, mockPayment);
router.get('/myorders', protect, getUserOrders);

export default router;
