import { supabase } from '../../config/supabase.js';

const TABLE = 'reviews';

// CREATE A REVIEW
export const createUserReview = async (supabase, { user_id, restaurant_id, rating, comment }) => {
    const { data, error } = await supabase
        .from(TABLE)
        .insert([{ user_id, restaurant_id, rating, comment }])
        .select()
        .single();

    
    if (error) throw error;
    return data;
};


// GET ALL REVIEWS FOR A RESTAURANT
export const getRestaurantReviews = async (supabase, restaurant_id) => {
    const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('restaurant_id', restaurant_id)
        .order('created_at', { ascending: false});

    if (error) throw error;
    return data;
};

// GET A SINGLE REVIEW BY ID
export const getReviewById = async (supabase, review_id) => {
    const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('review_id', review_id)
        .single();
        
    if (error) throw error;
    return data;
}

export const updateUserReview = async ( supabase, review_id, user_id, { rating, comment }) => {
    const { data: existing , error: fetchError } = await supabase
        .from(TABLE)
        .select()
        .eq('review_id', review_id)
        .single();

        if(fetchError || !existing) throw new Error ('Review not found!');
        if(existing.user_id !== user_id) throw new Error('You are not the owner of this review.');
    
    const { data, error } = await supabase
        .from(TABLE)
        .update({ rating, comment})
        .eq('review_id', review_id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

//DELETE A REVIEW
export const deleteUserReview = async (supabase, review_id, user_id) => {
    const { error } = await supabase
        .from(TABLE)
        .delete()
        .eq('review_id', review_id)
        .eq('user_id', user_id)

    if (error) throw error;
};






