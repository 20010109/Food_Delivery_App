import { supabase } from "../../config/supabase.js";

export const createUserProfile = async (userId, role) => {
    const {data, error} = await supabase
        .from("profiles")
        .insert([
            {
                id: userId,
                role: role || "customer"
            }
        ]);

    if (error) throw error;

    return data;
}