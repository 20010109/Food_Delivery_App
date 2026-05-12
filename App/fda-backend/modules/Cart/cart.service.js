/**
 * GET USER CART
 */
export const getUserCart = async (client, userId) => {
  // Get or create cart
  let { data: cart, error: fetchError } = await client
    .from("carts")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (fetchError && fetchError.code === "PGRST116") {
    // Cart doesn't exist, create it
    const { data: newCart, error: createError } = await client
      .from("carts")
      .insert([{ user_id: userId }])
      .select()
      .single();

    if (createError) throw createError;
    cart = newCart;
  } else if (fetchError) {
    throw fetchError;
  }

  // Get cart items with menu item details
  const { data: items, error: itemsError } = await client
    .from("cart_items")
    .select(`
      cart_item_id,
      item_id,
      restaurant_id,
      quantity,
      menu_items (
        item_id,
        name,
        price,
        item_image
      ),
      restaurants (
        restaurant_id,
        name
      )
    `)
    .eq("cart_id", cart.cart_id);

  if (itemsError) throw itemsError;

  return {
    cart_id: cart.cart_id,
    user_id: cart.user_id,
    items: items || [],
  };
};

/**
 * ADD ITEM TO CART
 */
export const addToCart = async (client, userId, itemId, restaurantId, quantity) => {
  // Ensure cart exists
  let { data: cart, error: cartError } = await client
    .from("carts")
    .select("cart_id")
    .eq("user_id", userId)
    .single();

  if (cartError && cartError.code === "PGRST116") {
    // Create cart if doesn't exist
    const { data: newCart, error: createError } = await client
      .from("carts")
      .insert([{ user_id: userId }])
      .select()
      .single();

    if (createError) throw createError;
    cart = newCart;
  } else if (cartError) {
    throw cartError;
  }

  // Check if item already exists in cart
  const { data: existingItem } = await client
    .from("cart_items")
    .select("cart_item_id, quantity")
    .eq("cart_id", cart.cart_id)
    .eq("item_id", itemId)
    .single();

  if (existingItem) {
    // Update quantity
    const { data, error } = await client
      .from("cart_items")
      .update({ quantity: existingItem.quantity + quantity })
      .eq("cart_item_id", existingItem.cart_item_id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Add new item
    const { data, error } = await client
      .from("cart_items")
      .insert([{
        cart_id: cart.cart_id,
        item_id: itemId,
        restaurant_id: restaurantId,
        quantity,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

/**
 * UPDATE CART ITEM QUANTITY
 */
export const updateCartItemQuantity = async (client, userId, cartItemId, quantity) => {
  // Verify the cart item belongs to the user
  const { data: cartItem, error: cartItemError } = await client
    .from("cart_items")
    .select(`
      cart_item_id,
      cart_id,
      carts (user_id)
    `)
    .eq("cart_item_id", cartItemId)
    .single();

  if (cartItemError || !cartItem) {
    throw new Error("Cart item not found");
  }

  if (cartItem.carts.user_id !== userId) {
    throw new Error("Unauthorized");
  }

  if (quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  const { data, error } = await client
    .from("cart_items")
    .update({ quantity })
    .eq("cart_item_id", cartItemId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * REMOVE ITEM FROM CART
 */
export const removeCartItem = async (client, userId, cartItemId) => {
  // Verify the cart item belongs to the user
  const { data: cartItem, error: cartItemError } = await client
    .from("cart_items")
    .select(`
      cart_item_id,
      cart_id,
      carts (user_id)
    `)
    .eq("cart_item_id", cartItemId)
    .single();

  if (cartItemError || !cartItem) {
    throw new Error("Cart item not found");
  }

  if (cartItem.carts.user_id !== userId) {
    throw new Error("Unauthorized");
  }

  const { error } = await client
    .from("cart_items")
    .delete()
    .eq("cart_item_id", cartItemId);

  if (error) throw error;
  return { message: "Item removed from cart" };
};

/**
 * CLEAR CART
 */
export const clearCart = async (client, userId) => {
  // Get cart
  const { data: cart, error: cartError } = await client
    .from("carts")
    .select("cart_id")
    .eq("user_id", userId)
    .single();

  if (cartError) throw cartError;

  // Delete all items
  const { error } = await client
    .from("cart_items")
    .delete()
    .eq("cart_id", cart.cart_id);

  if (error) throw error;
  return { message: "Cart cleared" };
};

/**
 * CLEAR CART BY RESTAURANT (for when user checks out with one restaurant)
 */
export const clearCartByRestaurant = async (client, userId, restaurantId) => {
  // Get cart
  const { data: cart, error: cartError } = await client
    .from("carts")
    .select("cart_id")
    .eq("user_id", userId)
    .single();

  if (cartError) throw cartError;

  // Delete items from specific restaurant
  const { error } = await client
    .from("cart_items")
    .delete()
    .eq("cart_id", cart.cart_id)
    .eq("restaurant_id", restaurantId);

  if (error) throw error;
  return { message: "Restaurant items removed from cart" };
};
