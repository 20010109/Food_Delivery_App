import express from 'express';
import { checkout } from './payments.controller.js';
import { authenticate } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/checkout', authenticate, checkout);

export default router;
