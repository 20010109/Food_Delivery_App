import { supabase } from "../../config/supabase.js";

export const createAddress = async (supabase, { user_id, address_line, longitude, latitude }) => {
    const { data, error } = await supabase
        .from("addresses")
        .insert([
            {
                user_id,
                address_line,
                longitude,
                latitude
            }
        ])
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const getAddress = async (supabase, user_id) => {
    const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user_id)
    if (error) throw error;
    return data;
};

export const updateAddress = async (supabase, address_id, { address_line, longitude, latitude }) => {
    const { data, error} = await supabase
        .from("addresses")
        .update({ address_line, longitude, latitude })
        .eq("address_id", address_id)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteAddress = async (supabase, address_id) => {
    const { data, error } = await supabase
        .from("addresses")
        .delete()
        .eq("address_id", address_id);
    if (error) throw error;
    return { message: "Address deleted successfully" };
}