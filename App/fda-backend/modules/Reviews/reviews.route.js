import express from "express";
import {
    createReview,
    getReviewsByRestaurant,
    getReview,
    updateReview,
    deleteReview,
} from '/reviews.controller.js';

import { authenticate } from "../../middleware/authMiddleware";

const router = express.Router();

router.post('/review', authenticate, createReview);
router.get('/reviews/restaurant/:restaurant_id', authenticate);
router.get('/review/:id', authenticate, getReview);
router.put('/review/:id', authenticate, updateReview);
router.delete('/review/:id', authenticate, deleteReview);

export default router;


