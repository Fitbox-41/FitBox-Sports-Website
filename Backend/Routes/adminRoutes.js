import express from 'express';
import { uploadProductImage } from '../Controllers/adminController.js';

const router = express.Router();

router.post('/upload-image', uploadProductImage);

export default router;
