

// =========================
// CURRENT DELIVERIES
// =========================
export const getRiderDeliveries = async (supabase, rider_id) => {
  const { data, error } = await supabase
    .from("deliveries")
    .select(`
      *,
      order:orders(
        order_id,
        total_price,
        status,
        created_at,
        user_id,
        restaurants(
          restaurant_id,
          name,
          contact_info,
          addresses(
            house_no,
            street,
            barangay,
            city,
            province
          )
        ),
        user:user_profiles!orders_user_id_fkey(
          first_name,
          last_name,
          contact_number,
          addresses(
            house_no,
            street,
            barangay,
            city,
            province,
            is_default
          )
        )
      ),
      rider:user_profiles!deliveries_user_id_fkey(
        first_name,
        last_name,
        contact_number
      )
    `)
    .eq("user_id", rider_id)
    .in("status", ["assigned", "picked_up"])
    .order("delivery_time", { ascending: true });

  if (error) throw error;
  return data;
};

// =========================
// DELIVERY HISTORY
// =========================
export const getRiderDeliveryHistory = async (supabase, rider_id) => {
  const { data, error } = await supabase
    .from("deliveries")
    .select(`
      *,
      order:orders(
        order_id,
        total_price,
        status,
        created_at,
        restaurants(
          restaurant_id,
          name,
          contact_info,
          addresses(
            house_no,
            street,
            barangay,
            city,
            province
          )
        ),
        user:user_profiles!orders_user_id_fkey(
          first_name,
          last_name,
          contact_number
        )
      )
    `)
    .eq("user_id", rider_id)
    .eq("status", "delivered")
    .order("delivery_time", { ascending: false });

  if (error) throw error;
  return data;
};

// =========================
// AVAILABLE DELIVERIES
// =========================
export const getAvailableDeliveries = async (supabase) => {
  const { data, error } = await supabase
    .from("deliveries")
    .select(`
      *,
      order:orders(
        order_id,
        total_price,
        status,
        created_at,
        restaurants(
          restaurant_id,
          name,
          contact_info,
          addresses(
            house_no,
            street,
            barangay,
            city,
            province
          )
        ),
        user:user_profiles!orders_user_id_fkey(
          first_name,
          last_name,
          contact_number
        )
      )
    `)
    .is("user_id", null)
    .eq("status", "pending")
    .order("delivery_time", { ascending: true });

  if (error) throw error;
  return data;
};

// =========================
// ACCEPT DELIVERY (ATOMIC)
// =========================
export const acceptDelivery = async (supabase, delivery_id, rider_id) => {
  const { data, error } = await supabase
    .from("deliveries")
    .update({
      user_id: rider_id,
      status: "assigned"
    })
    .eq("delivery_id", delivery_id)
    .is("user_id", null)
    .eq("status", "pending")
    .select()
    .single();

  if (error) throw error;

  if (!data) {
    throw new Error("Delivery already taken or unavailable");
  }

  return data;
};

// =========================
// UPDATE DELIVERY STATUS
// =========================
export const updateDeliveryStatus = async (
  supabase,
  delivery_id,
  rider_id,
  newStatus
) => {
  const validStatuses = ["assigned", "picked_up", "delivered"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error("Invalid delivery status");
  }

  // Get current delivery
  const { data: delivery, error: fetchError } = await supabase
    .from("deliveries")
    .select("*")
    .eq("delivery_id", delivery_id)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!delivery) throw new Error("Delivery not found");

  if (delivery.user_id !== rider_id) {
    throw new Error("You are not assigned to this delivery");
  }

  // OPTIONAL: enforce valid transitions
  const validTransitions = {
    assigned: ["picked_up"],
    picked_up: ["delivered"],
    delivered: []
  };

  if (!validTransitions[delivery.status]?.includes(newStatus)) {
    throw new Error("Invalid status transition");
  }

  // Update delivery (SECURE)
  const { data, error } = await supabase
    .from("deliveries")
    .update({
      status: newStatus,
      delivery_time: newStatus === "delivered" ? new Date() : null
    })
    .eq("delivery_id", delivery_id)
    .eq("user_id", rider_id)
    .select()
    .single();

  if (error) throw error;

  // Sync order status
  if (newStatus === "picked_up") {
    await supabase
      .from("orders")
      .update({ status: "out_for_delivery" })
      .eq("order_id", delivery.order_id);
  } else if (newStatus === "delivered") {
    await supabase
      .from("orders")
      .update({ status: "completed" })
      .eq("order_id", delivery.order_id);
  }

  return data;
};

// =========================
// GET DELIVERY BY ID
// =========================
export const getDeliveryById = async (supabase, delivery_id, rider_id) => {
  const { data, error } = await supabase
    .from("deliveries")
    .select(`
      *,
      order:orders(
        order_id,
        total_price,
        status,
        created_at,
        restaurants(
          restaurant_id,
          name,
          contact_info,
          addresses(
            house_no,
            street,
            barangay,
            city,
            province
          )
        ),
        user:user_profiles!orders_user_id_fkey(
          first_name,
          last_name,
          contact_number
        )
      )
    `)
    .eq("delivery_id", delivery_id)
    .eq("user_id", rider_id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// =========================
// GET DELIVERY BY ORDER ID
// =========================
export const getDeliveryByOrderId = async (supabase, order_id) => {
  const { data, error } = await supabase
    .from("deliveries")
    .select(`
      *,
      order:orders(
        order_id,
        total_price,
        status,
        created_at,
        restaurants(
          restaurant_id,
          name,
          contact_info,
          addresses(
            house_no,
            street,
            barangay,
            city,
            province
          )
        ),
        user:user_profiles!orders_user_id_fkey(
          first_name,
          last_name,
          contact_number
        )
      )
    `)
    .eq("order_id", order_id)
    .maybeSingle();

  if (error) throw error;
  return data;
};