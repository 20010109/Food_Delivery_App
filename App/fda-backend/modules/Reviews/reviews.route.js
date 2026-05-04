import express from "express";
import {
    createReview,
    getReviewsByRestaurant,
    getReview,
    updateReview,
    deleteReview,
} from './reviews.controller.js';

import { authenticate } from "../../middleware/authMiddleware.js";

const router = express.Router();

// MORE SPECIFIC ROUTES FIRST (to avoid parameter conflicts)
// AUTHENTICATED - Get single review by ID
router.get('/review/:id', authenticate, getReview);

// AUTHENTICATED - Update review
router.put('/:review_id', authenticate, updateReview);

// AUTHENTICATED - Delete review
router.delete('/:review_id', authenticate, deleteReview);

// PUBLIC - Get all reviews for a restaurant (no auth required)
router.get('/:restaurant_id', getReviewsByRestaurant);

// AUTHENTICATED - Create review for restaurant
router.post('/:restaurant_id', authenticate, createReview);

export default router;


