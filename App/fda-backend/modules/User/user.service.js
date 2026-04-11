import { supabase } from "../../config/supabase.js";

export const createUserProfile = async ({user_id, full_name, role, contact_number, profile_image }) => {
    const {data, error} = await supabase
        .from("user_profiles")
        .insert([
            {
                id: user_id,
                full_name,
                role: role,
                contact_number,
                profile_image
            }
        ]);
        if (error) throw error;

    return data;
};

export const getUserProfile = async (user_id) => {
    const {data, error} = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user_id)
        .single();
    if (error) throw error;
    return data;
};

export const updateUserProfile = async (user_id, { full_name, contact_number, profile_image }) => {
    const {data, error} = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("id", user_id)
        .single();
    if (error) throw error;
    return data;
};