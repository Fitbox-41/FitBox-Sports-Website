import express from 'express';
import { uploadProductImage } from '../Controllers/adminController.js';
import { getSettings, updateDeliveryFee } from '../Controllers/settingsController.js';

const router = express.Router();

router.post('/upload-image', uploadProductImage);
router.get('/settings', getSettings);
router.post('/settings/delivery-fee', updateDeliveryFee);

export default router;
