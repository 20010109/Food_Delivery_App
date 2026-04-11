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

export const signupUser = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });

    if (error) throw error;

    return data;
}

export const loginUser = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;
    
    return data;
}
