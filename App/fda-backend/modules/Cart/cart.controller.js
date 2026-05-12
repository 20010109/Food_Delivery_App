import * as cartService from "./cart.service.js";

/**
 * GET CART
 */
export const getCart = async (req, res) => {
  try {
    const data = await cartService.getUserCart(req.supabase, req.user.id);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

/**
 * ADD ITEM TO CART
 */
export const addItem = async (req, res) => {
  try {
    const { item_id, restaurant_id, quantity } = req.body;

    if (!item_id || !restaurant_id || !quantity) {
      throw new Error("item_id, restaurant_id, and quantity are required");
    }

    const data = await cartService.addToCart(
      req.supabase,
      req.user.id,
      item_id,
      restaurant_id,
      quantity
    );

    return res.status(201).json(data);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

/**
 * UPDATE CART ITEM QUANTITY
 */
export const updateItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      throw new Error("quantity is required");
    }

    const data = await cartService.updateCartItemQuantity(
      req.supabase,
      req.user.id,
      cartItemId,
      quantity
    );

    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

/**
 * REMOVE ITEM FROM CART
 */
export const removeItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;

    const data = await cartService.removeCartItem(
      req.supabase,
      req.user.id,
      cartItemId
    );

    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

/**
 * CLEAR ENTIRE CART
 */
export const clearEntireCart = async (req, res) => {
  try {
    const data = await cartService.clearCart(req.supabase, req.user.id);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

/**
 * CLEAR CART BY RESTAURANT
 */
export const clearRestaurantCart = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      throw new Error("restaurantId is required");
    }

    const data = await cartService.clearCartByRestaurant(
      req.supabase,
      req.user.id,
      restaurantId
    );

    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
