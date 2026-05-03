import { supabase } from "../../../config/supabase.js";

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

export const getWalletBalance = async (supabase, user_id) => {
    const { data, error } = await supabase
        .from("user_profiles")
        .select("wallet_balance")
        .eq("user_id", user_id)
        .single();

    if (error) throw error;

    return data.wallet_balance;
};

export const topUpWallet = async (supabase, user_id, amount) => {
    if (!amount || amount <= 0) {
        throw new Error("Amount must be greater than zero.");
    }

    const { data: profile, error: fetchError } = await supabase
        .from("user_profiles")
        .select("wallet_balance")
        .eq("user_id", user_id)
        .single();
    if (fetchError) throw fetchError;

    const { data, error } = await supabase
        .from("user_profiles")
        .update({ wallet_balance: Number(profile.wallet_balance) + Number(amount) })
        .eq("user_id", user_id)
        .select("wallet_balance")
        .single();
    if (error) throw error;

    return data.wallet_balance;
};

export const deductFromWallet = async (supabase, user_id, amount) => {
    if (!amount || amount <= 0) {
        throw new Error("Amount must be greater than zero.");
    }

    const { data: profile, error: fetchError } = await supabase
        .from("user_profiles")
        .select("wallet_balance")
        .eq("user_id", user_id)
        .single();
    if (fetchError) throw fetchError;

    if (Number(profile.wallet_balance) < Number(amount)) {
        throw new Error("Insufficient wallet balance.");
    }

    const { data, error } = await supabase
        .from("user_profiles")
        .update({ wallet_balance: Number(profile.wallet_balance) - Number(amount) })
        .eq("user_id", user_id)
        .select("wallet_balance")
        .single();
    if (error) throw error;

    return data.wallet_balance;
};

export const getGcashNumber = async (supabase, user_id) => {
    const { data, error } = await supabase
    .from("user_profiles")
    .select("gcash_number")
    .eq("user_id", user_id)
    .single();
    if (error) throw error;
    return data.gcash_number;
};

export const linkGcashNumber = async (supabase, user_id, gcash_number) => {
    const { data, error } = await supabase
    .from("user_profiles")
    .update({ gcash_number })
    .eq("user_id", user_id)
    .select("gcash_number")
    .single();
    if (error) throw error;
    return data.gcash_number;
};

export const unlinkGcashNumber = async (supabase, user_id) => {
    const { data, error } = await supabase
    .from("user_profiles")
    .update({ gcash_number: null })
    .eq("user_id", user_id)
    .select("gcash_number")
    .single();
    if (error) throw error;
};

export const getSavedCards = async (supabase, user_id) => {
    const { data, error } = await supabase
        .from("saved_cards")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
};

export const addSavedCard = async (supabase, user_id, { cardholder_name, card_number, expiry_month, expiry_year }) => {
    const last_four = String(card_number).slice(-4);
    const { data, error } = await supabase
        .from("saved_cards")
        .insert({ user_id, cardholder_name, last_four, expiry_month, expiry_year })
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteSavedCard = async (supabase, user_id, card_id) => {
    const { error } = await supabase
        .from("saved_cards")
        .delete()
        .eq("card_id", card_id)
        .eq("user_id", user_id);
    if (error) throw error;
};
