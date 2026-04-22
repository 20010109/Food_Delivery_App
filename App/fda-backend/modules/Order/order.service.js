import { supabase } from "../../config/supabase.js";

export const createUserOrder = async (supabase, { user_id, restaurant_id, items }) => {
  // checker
  if(!Array.isArray(items) || items.length === 0) {
    throw new Error("Order must contain at least one item.");
  }

  // checker
  for(const item of items){
    if(!item.item_id || !item.quantity || item.quantity <= 0) {
      throw new Error("Each item must have a valid item_id and quantity greater than 0.");
    }
  }

  // one active order per restaurant
  const { data: existingOrder, error: existingOrderError } = await supabase
    .from("orders")
    .select("order_id")
    .eq("user_id", user_id)
    .eq("restaurant_id", restaurant_id)
    .in("status", ["pending", "preparing", "out_for_delivery"])
    .maybeSingle();

    if(existingOrderError) throw existingOrderError;
    if(existingOrder) {
      throw new Error("You already have an active order with this restaurant. Please complete or cancel it before placing a new one.");
    }
    
    // get unique item IDs from the order
    const itemIds = [...new Set(items.map((item) =>  item.item_id))];

    // load menu items
    const { data: menuItems, error: menuItemsError } = await supabase
      .from("menu_items")
      .select("item_id, price, restaurant_id")
      .in("item_id", itemIds);

    if(menuItemsError) throw menuItemsError;
    if(!menuItems || menuItems.length !== itemIds.length) {
      throw new Error("One or more items in the order are invalid.");
    }

    // validate if product belongs to the restaurant
    const invalidRestaurantItem = menuItems.find((menuItem) => menuItem.restaurant_id !== restaurant_id);
    if(invalidRestaurantItem) {
      throw new Error(`Item with ID ${invalidRestaurantItem.item_id} does not belong to the specified restaurant.`);
    }

    // calculate total price
    const priceMap = new Map(menuItems.map((menuItem) => [menuItem.item_id, Number(menuItem.price)]));
    const total_price = items.reduce((sum, item) => sum + priceMap.get(item.item_id) * item.quantity, 0);

    // insert order
    const {data: order, error: orderError} = await supabase
    .from("orders")
    .insert([
      {
        user_id,
        restaurant_id,
        total_price,
        status: "pending"
      }
    ])
    .select()
    .single();

    if(orderError) throw orderError;

    // insert order items
    const order_items = items.map(({ item_id, quantity }) => ({
      order_id: order.order_id,
      item_id: item_id,
      quantity: quantity
    }));

    const { data: insertedItems, error: itemsError } = await supabase
    .from("order_items")
    .insert(order_items)
    .select();

    if(itemsError){
      await supabase.from("orders").delete().eq("order_id", order.order_id);
      throw itemsError;
    }

    return { order, items: insertedItems };
};

export const getUserOrders = async (supabase, user_id) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*), restaurants(name)")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });
    
  if (error) throw error;
  return data;
};

export const getUserOrderById = async (supabase, order_id, user_id) => {
  const { data, error} = await supabase
    .from("orders")
    .select("*, order_items(*), restaurants(name)")
    .eq("order_id", order_id)
    .eq("user_id", user_id)
    .single();

  if (error) throw error;
  return data;
};

export const updateUserOrderStatus = async (supabase, order_id, user_id, newStatus) => {
  const validStatuses = ["pending", "preparing", "out_for_delivery", "delivered", "cancelled"];
  if(!validStatuses.includes(newStatus)) {
    throw new Error("Invalid order status.");
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("order_id", order_id)
    .eq("user_id", user_id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export const deleteUserOrder = async (supabase, order_id, user_id) => {
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("status")
    .eq("order_id", order_id)
    .eq("user_id", user_id)
    .single();

  if (fetchError) throw fetchError;
  if(order.status !== "pending") {
    throw new Error("Only pending orders can be cancelled.");
  }

  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("order_id", order_id)
    .eq("user_id", user_id);
  if (error) throw error;
  return { message: "Order cancelled successfully." };
};

