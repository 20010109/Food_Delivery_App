import { supabase } from "../../config/supabase.js";

export const createUserProfile = async (supabase, {user_id, first_name, last_name, role, contact_number, profile_image }) => {
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

export const getUserProfile = async (supabase, user_id) => {
    const {data, error} = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user_id)
        .single();
    if (error) throw error;
    return data;
};

export const updateUserProfile = async (supabase, user_id, { first_name, last_name, contact_number, profile_image }) => {
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


// SETUP USER

export const setupUserService = async (supabase, user_id, payload) => {
    const {
      first_name,
      last_name,
      contact_number,
      role = "customer",
  
      house_no,
      street,
      barangay,
      city,
      province,
      postal_code,
    } = payload;
  
    // 1. UPSERT PROFILE
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .upsert(
        {
          user_id,
          first_name,
          last_name,
          contact_number,
          role,
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();
  
    if (profileError) {
      throw new Error(profileError.message);
    }
  
    // 2. CREATE ADDRESS
    const { data: address, error: addressError } = await supabase
      .from("addresses")
      .insert([
        {
          user_id,
          house_no,
          street,
          barangay,
          city,
          province,
          postal_code,
          country: "Philippines",
          is_default: true,
        },
      ])
      .select()
      .single();
  
    if (addressError) {
      // OPTIONAL CLEANUP (important for consistency)
      await supabase
        .from("user_profiles")
        .delete()
        .eq("user_id", user_id);
  
      throw new Error(addressError.message);
    }
  
    return {
      profile,
      address,
    };
  };




// CUSTOMER REGISTER AS STOREOWNER

export const updateUserRole = async (supabase, user_id, role) => {
    const { data, error } = await supabase
        .from("user_profiles")
        .update({ role })
        .eq("user_id", user_id)
        .select()
        .single();

    if (error) throw error;
    return data;
};