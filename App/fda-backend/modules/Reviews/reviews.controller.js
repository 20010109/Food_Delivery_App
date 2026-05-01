import {
    createUserReview,
    getRestaurantReviews,
    getReviewById,
    updateUserReview,
    deleteUserReview,
} from './reviews.service.js';

export const createReview = async (req ,res) => {
    try {
        const user_id = req.user.id;
        const { restaurant_id, rating, comment } = req.body;

        if (!restaurant_id || !rating){
            return res.status(400).json({ error: 'restaurant_id and rating are required..'});
        }

        const review = await createUserReview(req.supabase, { user_id, restaurant_id, rating, comment });
        return res.status(201).json (review);
    } catch (error) {
        return res.status(500).json({ error: error.message});
    }
};

export const getReviewsByRestaurant = async (req, res) => {
    try{
        const { restaurant_id } = req.params;
        const reviews = await getRestaurantReviews(req.supabase, restaurant_id);
        return res.status(200).json(reviews);
    } catch (error) {
        return res.status(500).json ({ error: error.message });
    }
};

export const getReview = async (req, res) => {
    try{
        const { id } = req.params;
        const review = await getReviewById(req.supabase, id);
        return res.status(200).json(review);
    }catch (error) {
        return res.status(500).json ({ error: error.message});
    }
};

export const updateReview = async (req, res) => {
    try{
        const user_id = req.user.id;
        const { id } = req.params;
        const { rating, comment } = req.body;

        if(!rating && !comment){
            return res.status(400).json({ error: 'Provide at least a rating or comment to update.'});
        }

        const review = await updateUserReview(req.supabase, id, user_id, { rating, comment });
        return res.status(200).json(review);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


export const deleteReview = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { id } = req.params;
        await deleteUserReview(req.supabase, id, user_id);
        return res.status(200).json({ message: 'Review deleted successfully.'});
    } catch (error) {
        return res.status(500).json({ error: error.message});
    }
};