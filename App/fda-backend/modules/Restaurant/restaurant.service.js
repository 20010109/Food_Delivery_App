import { supabase } from "../../config/supabase.js";

const TABLE = "restaurants";

// CREATE (you already fixed this)
export const createRestaurant = async (supabase, userId, payload) => {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([
      {
        ...payload,
        user_id: userId,
        status: "pending",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// GET OWNER RESTAURANTS
export const getRestaurantsByOwner = async (supabase, userId) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return data;
};

// UPDATE
export const updateRestaurant = async (supabase, restaurantId, userId, payload) => {
  // console.log("Updating ID:", restaurantId);
  // console.log("User ID:", userId);
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq("restaurant_id", restaurantId)
    .eq("user_id", userId)
    .select()
    .single();

    //console.log("UPDATE RESULT:", data);
  if (error) throw error;
  return data;
};

// DELETE
export const deleteRestaurant = async (supabase, restaurantId, userId) => {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("restaurant_id", restaurantId)
    .eq("user_id", userId);

  if (error) throw error;
};

// ✅ PUBLIC (CUSTOMER SIDE)
export const getApprovedRestaurants = async () => {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("status", "approved");

  if (error) throw error;
  return data;
};

export const getRestaurantById = async (supabase, restaurantId) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("status", "approved") // 🔥 important for public access
    .single();

    if (error) throw error;
    return data;
  };

  // ADMIN
  export const applyStoreOwner = async (supabase, userId, payload) => {
    // 1. Check if already storeowner
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", userId)
      .single();
  
    if (profile.role === "storeowner") {
      throw new Error("Already a store owner");
    }
  
    // 2. Create restaurant (PENDING)
    const { data, error } = await supabase
      .from("restaurants")
      .insert([
        {
          user_id: userId,
          ...payload,
          status: "pending",
        },
      ])
      .select()
      .single();
  
    if (error) throw error;
  
    return data;
  };

  export const getAllRestaurants = async (supabase) => {
    const { data, error } = await supabase
      .from("restaurants")
      .select(`
        restaurant_id,
        name,
        contact_info,
        profile_image,
        background_image,
        status,
        created_at,
        user_id,
        user_profiles (
          user_id,
          first_name,
          last_name,
          role,
          contact_number,
          profile_image,
          is_active
        )
      `);
  
    if (error) throw error;
    return data;
  };

export const updateRestaurantStatus = async (supabase, restaurantId, status) => {
  const allowedStatuses = ["approved", "denied"];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid status");
  }

  // 1. Update restaurant status only
  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .update({ status })
    .eq("restaurant_id", restaurantId)
    .select("restaurant_id, user_id, status")
    .single();

  if (error) throw error;

  // 2. ONLY promote role once (no downgrade ever)
  if (status === "approved") {
    await supabase
      .from("user_profiles")
      .update({ role: "storeowner" })
      .eq("user_id", restaurant.user_id);
  }

  return restaurant;
};
  