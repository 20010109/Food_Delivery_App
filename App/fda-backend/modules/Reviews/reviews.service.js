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

    // Fetch user profile separately and merge
    const { data: profile } = await supabase
        .from("user_profiles")
        .select("user_id, first_name, last_name, profile_image")
        .eq("user_id", user_id)
        .single();

    return {
        ...data,
        user_profiles: profile || null,
    };
};


// GET ALL REVIEWS FOR A RESTAURANT
export const getRestaurantReviews = async (supabase, restaurant_id) => {
    // Fetch all reviews
    const { data: reviews, error } = await supabase
        .from(TABLE)
        .select("*")
        .eq('restaurant_id', restaurant_id)
        .order('created_at', { ascending: false});

    if (error) throw error;

    if (!reviews || reviews.length === 0) return [];

    // Fetch all user profiles for these reviews
    const userIds = [...new Set(reviews.map(r => r.user_id))];
    
    const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, first_name, last_name, profile_image")
        .in("user_id", userIds);

    // Create a map of user profiles
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    // Merge reviews with user profiles
    return reviews.map(review => ({
        ...review,
        user_profiles: profileMap.get(review.user_id) || null,
    }));
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






