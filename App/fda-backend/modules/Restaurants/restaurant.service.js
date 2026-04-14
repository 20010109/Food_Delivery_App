import { supabase } from "../utils/supabaseClient.js";

const TABLE = "restaurants";

export const createRestaurant = async (userId, payload) => {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([{ ...payload, owner_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getRestaurantsByOwner = async (userId) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("owner_id", userId);

  if (error) throw error;
  return data;
};

export const updateRestaurant = async (id, userId, payload) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq("id", id)
    .eq("owner_id", userId) // security: only owner can update
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteRestaurant = async (id, userId) => {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .eq("owner_id", userId);

  if (error) throw error;
};