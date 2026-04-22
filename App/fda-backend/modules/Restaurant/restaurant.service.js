import { supabase } from "../../config/supabase.js";

const TABLE = "restaurants";

// CREATE (you already fixed this)
export const createRestaurant = async (supabase, userId, payload) => {
  // console.log("SUPABASE USER:", await supabase.auth.getUser());
  // console.log("USER ID:", userId);
  // console.log("PAYLOAD:", payload);
  const { data, error } = await supabase
    .from(TABLE)
    .insert([
      {
        ...payload,
        user_id: userId,
        status: "pending"
      }
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

export const getRestaurantById = async (supabase, id) => {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("restaurant_id", id)
    .eq("status", "approved") // 🔥 important for public access
    .single();

  if (error) throw error;
  return data;
};