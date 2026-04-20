import { supabase } from "../../config/supabase.js";

export const createUserOrder = async (supabase, { user_id, restaurant_id, items, total_price}) => {
  if(!Array.isArray(items) || items.length === 0) {
    throw new Error("Order must contain at least one item.");
  }

  const { data: existingOrder, error: existingOrderError } = await supabase
    .from("orders")
    .select("order_id")
    .eq("user_id", user_id)
    .eq("restaurant_id", restaurant_id)
    .in("status", ["pending", "confirmed", "preparing", "out_for_delivery"])
    .maybeSingle();

    if(existingOrderError) throw existingOrderError;
    if(existingOrder) {
      throw new Error("You already have an active order with this restaurant. Please complete or cancel it before placing a new one.");
    }

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

    const order_items = items.map(({ item_id, quantity }) => ({
      order_id: order.order_id,
      item_id,
      quantity
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

  if (error) throw error;
  return { message: "Order cancelled successfully." };
};