import * as menuService from "./menu.service.js";
import { supabase } from "../../config/supabase.js";

/**
 * CREATE MENU ITEM
 */
export const createItem = async (req, res) => {
  try {
    const restaurant_id = req.body.restaurant_id || req.body.restaurantId;

    if (!restaurant_id) {
      throw new Error("restaurant_id is required");
    }

    const payload = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      item_image: req.body.item_image,
    };

    const data = await menuService.createMenuItem(
      req.supabase,
      req.user.id,
      restaurant_id,
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
    const restaurant_id = req.params.restaurantId;

    const data = await menuService.getMenuItems(
      req.supabase,
      req.user.id,
      restaurant_id
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

export const getPopularMenuItems = async (req, res) => {
  try {
    const { data, error } = await supabase.rpc("get_popular_items");

    if (error) {
      console.error("RPC ERROR:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json(data || []);
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const getPublicMenu = async (req, res) => {
  try {
    const data = await menuService.getPublicMenu(req.params.restaurantId);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};