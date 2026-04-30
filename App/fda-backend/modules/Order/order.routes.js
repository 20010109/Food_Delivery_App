import express from 'express';
import { getOrders, getOrderById, updateOrderStatus, cancelOrder } from './order.controller.js';
import { authenticate } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/orders', authenticate, getOrders);
router.get('/order/:id', authenticate, getOrderById);
router.put('/order/:id/status', authenticate, updateOrderStatus);
router.delete('/order/:id', authenticate, cancelOrder);

export default router;