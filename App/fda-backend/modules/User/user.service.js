import { supabase } from "../../config/supabase.js";

export const createUserProfile = async ({user_id, first_name, last_name, role, contact_number, profile_image }) => {
    const {data, error} = await supabase
        .from("user_profiles")
        .insert([
            {
                user_id: user_id,
                first_name: first_name,
                last_name: last_name,
                role: role,
                contact_number: contact_number,
                profile_image: profile_image
            }
        ])
        .select()
        .single();
        if (error) throw error;

    return data;
};

export const getUserProfile = async (user_id) => {
    const {data, error} = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user_id)
        .single();
    if (error) throw error;
    return data;
};

export const updateUserProfile = async (user_id, { first_name, last_name, contact_number, profile_image }) => {
    const updates = {first_name, last_name, contact_number, profile_image};
    
    const {data, error} = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("user_id", user_id)
        .select()
        .single();
    if (error) throw error;
    return data;
};