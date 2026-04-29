import { supabase } from "../../config/supabase.js";

const TABLE = "restaurants";

// CREATE (you already fixed this)
export const createRestaurant = async (supabase, userId, payload) => {
  console.log("🔥 CREATE RESTAURANT PAYLOAD:", payload);
  console.log("🔥 USER ID:", userId);

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

  if (error) {
    console.error("❌ SUPABASE ERROR:", error);
    throw error;
  }

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

export const getAllRestaurants = async (supabase) => {
  const { data, error } = await supabase
    .from("restaurants")
    .select(`
      restaurant_id,
      name,
      contact_info,
      status,
      created_at,
      user_profiles (
        first_name,
        last_name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const updateRestaurantStatus = async (
  supabase,
  userId,
  restaurantId,
  status
) => {
  // get role from user_profiles
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (profileError) throw profileError;

  if (profile.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const allowedStatuses = ["approved", "denied", "pending"];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid status");
  }

  const { data, error } = await supabase
    .from("restaurants")
    .update({ status })
    .eq("restaurant_id", restaurantId)
    .select()
    .single();

  if (error) throw error;

  return data;
};