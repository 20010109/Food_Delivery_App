export const createUserOrder = async (
  supabase,
  { user_id, restaurant_id, items, delivery_fee = 0, tip = 0 }
) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Order must contain at least one item.");
  }

  for (const item of items) {
    if (!item.item_id || !item.quantity || Number(item.quantity) <= 0) {
      throw new Error(
        "Each item must have a valid item_id and quantity greater than 0."
      );
    }
  }

  const normalizedRestaurantId = String(restaurant_id);

  const { data: existingOrders, error: existingOrderError } = await supabase
    .from("orders")
    .select("order_id")
    .eq("user_id", user_id)
    .eq("restaurant_id", restaurant_id)
    .in("status", ["pending", "preparing", "out_for_delivery"])
    .limit(1);

  if (existingOrderError) throw existingOrderError;

  if (existingOrders && existingOrders.length > 0) {
    throw new Error(
      "You already have an active order with this restaurant. Please complete or cancel it before placing a new one."
    );
  }

  const itemIds = [...new Set(items.map((item) => item.item_id))];

  const { data: menuItems, error: menuItemsError } = await supabase
    .from("menu_items")
    .select("item_id, price, restaurant_id")
    .in("item_id", itemIds);

  if (menuItemsError) throw menuItemsError;

  if (!menuItems || menuItems.length !== itemIds.length) {
    throw new Error("One or more items in the order are invalid.");
  }

  const invalidRestaurantItem = menuItems.find(
    (menuItem) => String(menuItem.restaurant_id) !== normalizedRestaurantId
  );

  if (invalidRestaurantItem) {
    throw new Error(
      `Item with ID ${invalidRestaurantItem.item_id} does not belong to the specified restaurant.`
    );
  }

  const priceMap = new Map(
    menuItems.map((menuItem) => [
      String(menuItem.item_id),
      Number(menuItem.price),
    ])
  );

  const itemSubtotal = items.reduce((sum, item) => {
    const itemPrice = priceMap.get(String(item.item_id)) || 0;
    return sum + itemPrice * Number(item.quantity || 0);
  }, 0);

  const total_price =
    itemSubtotal + Number(delivery_fee || 0) + Number(tip || 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([
      {
        user_id,
        restaurant_id,
        total_price,
        status: "pending",
      },
    ])
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = items.map(({ item_id, quantity }) => ({
    order_id: order.order_id,
    item_id,
    quantity: Number(quantity),
  }));

  const { data: insertedItems, error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems)
    .select();

  if (itemsError) {
    await supabase.from("orders").delete().eq("order_id", order.order_id);
    throw itemsError;
  }

  return {
    order,
    items: insertedItems,
  };
};

export const getUserOrders = async (supabase, user_id) => {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      restaurants(name),
      order_items(
        order_item_id,
        order_id,
        item_id,
        quantity,
        menu_items(
          name,
          price,
          item_image
        )
      )
    `
    )
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
};

export const getUserOrderById = async (supabase, order_id, user_id) => {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      restaurants(name),
      order_items(
        order_item_id,
        order_id,
        item_id,
        quantity,
        menu_items(
          name,
          price,
          item_image
        )
      )
    `
    )
    .eq("order_id", order_id)
    .eq("user_id", user_id)
    .single();

  if (error) throw error;

  return data;
};

export const updateUserOrderStatus = async (
  supabase,
  order_id,
  user_id,
  newStatus
) => {
  const validStatuses = [
    "pending",
    "preparing",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ];

  if (!validStatuses.includes(newStatus)) {
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
};

export const deleteUserOrder = async (supabase, order_id, user_id) => {
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("order_id, status")
    .eq("order_id", order_id)
    .eq("user_id", user_id)
    .single();

  if (fetchError) throw fetchError;

  if (order.status !== "pending") {
    throw new Error("Only pending orders can be cancelled.");
  }

  const { data: cancelledOrder, error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("order_id", order_id)
    .eq("user_id", user_id)
    .eq("status", "pending")
    .select()
    .single();

  if (error) throw error;

  // Check if paid by wallet — if so, refund
  const { data: payment } = await supabase
    .from("payments")
    .select("method, amount")
    .eq("order_id", order_id)
    .eq("status", "paid")
    .maybeSingle();

  if (payment?.method === "wallet") {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("wallet_balance")
      .eq("user_id", user_id)
      .single();

    await supabase
      .from("user_profiles")
      .update({ wallet_balance: Number(profile.wallet_balance) + Number(payment.amount) })
      .eq("user_id", user_id);

    // Mark payment as refunded
    await supabase
      .from("payments")
      .update({ status: "refunded" })
      .eq("order_id", order_id);
  }
  
  return cancelledOrder;
};


// ===== STOREOWNER =====

export const getRestaurantOrders = async (supabase, restaurantId) => {
  // Step 1: fetch orders with items
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items(
        order_item_id,
        quantity,
        menu_items(name, price, item_image)
      )
    `)
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Step 2: fetch user profiles separately
  const userIds = [...new Set(orders.map((o) => o.user_id))];

  const { data: profiles, error: profileError } = await supabase
    .from("user_profiles")
    .select("user_id, first_name, last_name, contact_number")
    .in("user_id", userIds);

  if (profileError) throw profileError;

  const profileMap = new Map(profiles.map((p) => [p.user_id, p]));

  // Step 3: merge
  return orders.map((order) => ({
    ...order,
    user_profiles: profileMap.get(order.user_id) || null,
  }));
};

export const updateRestaurantOrderStatus = async (
  supabase,
  orderId,
  restaurantId,
  newStatus
) => {
  const validStatuses = [
    "pending",
    "preparing",
    "out_for_delivery",
    "completed",
    "cancelled",
  ];

  if (!validStatuses.includes(newStatus)) {
    throw new Error("Invalid order status.");
  }

  // Verify order belongs to this restaurant
  const { data: existing, error: fetchError } = await supabase
    .from("orders")
    .select("order_id, restaurant_id, status")
    .eq("order_id", orderId)
    .eq("restaurant_id", restaurantId)
    .single();

  if (fetchError) throw new Error("Order not found: " + fetchError.message);
  if (!existing) throw new Error("Order not found.");

  // Update status
  const { data, error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("order_id", orderId)
    .eq("restaurant_id", restaurantId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getRestaurantOrderStats = async (supabase, restaurantId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("orders")
    .select("order_id, total_price, status, created_at")
    .eq("restaurant_id", restaurantId);

  if (error) throw error;

  const todayOrders = data.filter(
    (o) => new Date(o.created_at) >= today
  );

  const revenue = data
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + Number(o.total_price || 0), 0);

  const activeOrders = data.filter((o) =>
    ["pending", "preparing"].includes(o.status)
  ).length;

  return {
    ordersToday: todayOrders.length,
    totalRevenue: revenue,
    activeOrders,
  };
};