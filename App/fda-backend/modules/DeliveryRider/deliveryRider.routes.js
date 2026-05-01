import express from 'express';
import { 
  getRiderCurrentDeliveries, 
  getRiderHistory, 
  acceptDelivery, 
  updateDeliveryStatus,
  getDeliveryDetails,
  getAvailableDeliveriesController
} from './deliveryRider.controller.js';
import { authenticate } from '../../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get available deliveries
router.get('/available', getAvailableDeliveriesController);

// Get rider's current active deliveries
router.get('/deliveries', getRiderCurrentDeliveries);

// Get rider's delivery history
router.get('/history', getRiderHistory);

// Accept a delivery
router.post('/accept', acceptDelivery);

// Update delivery status
router.put('/status', updateDeliveryStatus);

// Get delivery details
router.get('/delivery/:id', getDeliveryDetails);

export default router;
