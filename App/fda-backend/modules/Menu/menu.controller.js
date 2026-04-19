import * as menuService from "./menu.service.js";

/**
 * CREATE MENU ITEM
 */
export const createItem = async (req, res) => {
  try {
    const { restaurantId, ...payload } = req.body;

    // console.log("BODY:", req.body);
    // console.log("USER:", req.user);

    const data = await menuService.createMenuItem(
      req.supabase,
      req.user.id,
      restaurantId,
      payload
    );
    

    return res.status(201).json(data);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

/**
 * GET MENU ITEMS (storeowner - own restaurant)
 */
export const getItems = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const data = await menuService.getMenuItems(
      req.supabase,
      req.user.id,
      restaurantId
    );

    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

/**
 * UPDATE MENU ITEM
 */
export const updateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const payload = req.body;

    const data = await menuService.updateMenuItem(
      req.supabase,
      req.user.id,
      itemId,
      payload
    );

    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

/**
 * DELETE MENU ITEM
 */
export const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const data = await menuService.deleteMenuItem(
      req.supabase,
      req.user.id,
      itemId
    );

    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const getPublicMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const { data, error } = await req.supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("is_available", true); // optional but recommended

    if (error) throw error;

    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};