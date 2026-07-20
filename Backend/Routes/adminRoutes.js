import express from 'express';
import { getSettings } from '../Controllers/settingsController.js';

const router = express.Router();

router.get('/settings', getSettings);

export default router;
