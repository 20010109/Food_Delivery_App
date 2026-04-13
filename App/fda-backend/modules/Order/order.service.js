import { supabase } from "../config/supabaseClient.js";

export const createOrder = async (userId, restaurantId, items) => {
  // 1. Get item prices from DB
  const itemIds = items.map(i => i.item_id);

  const { data: menuItems, error: menuError } = await supabase
    .from("menu_items")
    .select("item_id, price")
    .in("item_id", itemIds);

  if (menuError) throw menuError;

  // 2. Compute total
  let total = 0;
  const orderItemsData = items.map(item => {
    const menu = menuItems.find(m => m.item_id === item.item_id);
    const subtotal = menu.price * item.quantity;
    total += subtotal;

    return {
      item_id: item.item_id,
      quantity: item.quantity
    };
  });

  // 3. Insert order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      restaurant_id: restaurantId,
      total_price: total,
      status: "pending"
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // 4. Insert order items
  const orderItemsPayload = orderItemsData.map(item => ({
    ...item,
    order_id: order.order_id
  }));

  await supabase.from("order_items").insert(orderItemsPayload);

  // 5. Create payment record
  await supabase.from("payments").insert({
    order_id: order.order_id,
    amount: total,
    status: "pending"
  });

  return order;
};