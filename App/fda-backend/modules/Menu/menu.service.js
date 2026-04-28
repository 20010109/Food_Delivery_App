import { supabase } from "../../config/supabase.js";

/**
 * VALIDATE RESTAURANT OWNERSHIP
 */
const validateRestaurant = async (client, userId, restaurantId) => {
console.log("restaurantId:", restaurantId);
  const { data, error } = await client
    .from("restaurants")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .single();
    

  if (error || !data) throw new Error("Restaurant not found");

  if (data.user_id !== userId) {
    throw new Error("Unauthorized");
  }

  return data;
};

/**
 * CREATE MENU ITEM
 */
export const createMenuItem = async (client, userId, restaurantId, payload) => {
  await validateRestaurant(client, userId, restaurantId);

  const { data, error } = await client
    .from("menu_items")
    .insert([{
      ...payload,
      restaurant_id: restaurantId
    }])
    .select()
    .single();

  if (error) throw error;

  return data;
};

/**
 * GET MENU ITEMS
 */
export const getMenuItems = async (client, userId, restaurantId) => {
  await validateRestaurant(client, userId, restaurantId);

  const { data, error } = await client
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", restaurantId);

  if (error) throw error;

  return data;
};

/**
 * UPDATE MENU ITEM
 */
export const updateMenuItem = async (client, userId, itemId, payload) => {
  const { data: item, error } = await client
    .from("menu_items")
    .select("*")
    .eq("item_id", itemId)
    .single();

  if (error || !item) throw new Error("Item not found");

  await validateRestaurant(client, userId, item.restaurant_id);

  const { data, error: updateError } = await client
    .from("menu_items")
    .update(payload)
    .eq("item_id", itemId)
    .select()
    .single();

  if (updateError) throw updateError;

  return data;
};

/**
 * DELETE MENU ITEM
 */
export const deleteMenuItem = async (client, userId, itemId) => {
  const { data: item, error } = await client
    .from("menu_items")
    .select("*")
    .eq("item_id", itemId)
    .single();

  if (error || !item) throw new Error("Item not found");

  await validateRestaurant(client, userId, item.restaurant_id);

  const { error: deleteError } = await client
    .from("menu_items")
    .delete()
    .eq("item_id", itemId);

  if (deleteError) throw deleteError;

  return { message: "Deleted successfully" };
};

/**
 * PUBLIC MENU
 */
export const getPublicMenu = async (restaurantId) => {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", restaurantId);

  if (error) throw error;

  return data;
};