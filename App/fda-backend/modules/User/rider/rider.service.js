import { supabase } from "../../../config/supabase.js";

// =========================
// CREATE RIDER PROFILE (ONBOARDING STEP 1)
// =========================
export const createRiderProfile = async (
  supabase,
  {
    user_id,
    vehicle_type,
    vehicle_plate_number,
    license_number,
    or_code,
    cr_code,
  }
) => {
  const { data, error } = await supabase
    .from("rider_profiles")
    .insert([
      {
        user_id,
        vehicle_type,
        vehicle_plate_number,
        license_number,
        or_code,
        cr_code,
        availability_status: "offline",
        verification_status: "pending",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// =========================
// GET RIDER PROFILE
// =========================
export const getRiderProfile = async (supabase, user_id) => {
  const { data, error } = await supabase
    .from("rider_profiles")
    .select("*")
    .eq("user_id", user_id)
    .single();

  if (error) throw error;
  return data;
};

// =========================
// UPDATE RIDER PROFILE
// =========================
export const updateRiderProfile = async (
  supabase,
  user_id,
  updates
) => {
  const { data, error } = await supabase
    .from("rider_profiles")
    .update(updates)
    .eq("user_id", user_id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// =========================
// UPDATE AVAILABILITY STATUS
// =========================
export const updateRiderAvailability = async (
  supabase,
  user_id,
  status
) => {
  const allowed = ["offline", "online", "busy", "suspended"];

  if (!allowed.includes(status)) {
    throw new Error("Invalid availability status");
  }

  const { data, error } = await supabase
    .from("rider_profiles")
    .update({ availability_status: status })
    .eq("user_id", user_id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// =========================
// ADMIN: UPDATE VERIFICATION STATUS
// =========================
export const updateRiderVerificationStatus = async (
  supabase,
  rider_id,
  status
) => {
  const allowed = ["pending", "approved", "denied"];

  if (!allowed.includes(status)) {
    throw new Error("Invalid verification status");
  }

  // 1. Get user_id from rider_profiles
  const { data: rider, error: fetchError } = await supabase
    .from("rider_profiles")
    .select("user_id")
    .eq("id", rider_id)
    .single();

  if (fetchError) throw fetchError;

  const user_id = rider.user_id;

  // 2. Update rider verification status
  const { data: riderData, error: riderError } = await supabase
    .from("rider_profiles")
    .update({ verification_status: status })
    .eq("id", rider_id)
    .select()
    .single();

  if (riderError) throw riderError;

  // 3. Sync role
  if (status === "approved") {
    const { error: roleError } = await supabase
      .from("user_profiles")
      .update({ role: "rider" })
      .eq("user_id", user_id);

    if (roleError) throw roleError;
  }

  return riderData;
};

// =========================
// GET ALL RIDERS (ADMIN USE)
// =========================
export const getAllRiders = async (supabase) => {
  const { data, error } = await supabase
    .from("rider_profiles")
    .select(`
      *,
      user:user_profiles (
        first_name,
        last_name,
        contact_number,
        profile_image
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};


// =========================
// GET AVAILABLE ORDERS (POOL)
// =========================
export const getAvailableOrders = async (supabase) => {
  // 1. Get all orders already assigned/picked_up
  const { data: assigned, error: assignedError } = await supabase
    .from("deliveries")
    .select("order_id")
    .in("status", ["assigned", "picked_up"]);

  if (assignedError) throw assignedError;

  const assignedIds = assigned.map((d) => d.order_id);

  // 2. Build orders query
  let query = supabase
    .from("orders")
    .select(`
      order_id,
      total_price,
      created_at,
      restaurants (
        name,
        contact_info,
        profile_image,
        address_id,
        addresses ( house_no, street, barangay, city )
      ),
      user_profiles!orders_user_id_fkey (
        first_name,
        last_name,
        contact_number
      ),
      order_items (
        quantity,
        menu_items ( name, price )
      )
    `)
    .eq("status", "out_for_delivery");

    
    // 3. Exclude assigned orders ONLY if there are any
    if (assignedIds.length > 0) {
      query = query.not("order_id", "in", `(${assignedIds.join(",")})`);
    }
    
    const { data, error } = await query;

    
  if (error) throw error;
  return data;
};

// =========================
// CLAIM AN ORDER
// =========================
export const claimDelivery = async (supabase, riderId, orderId) => {
  // Check rider has no active delivery
  const { data: active } = await supabase
    .from("deliveries")
    .select("delivery_id")
    .eq("user_id", riderId)
    .in("status", ["assigned", "picked_up"])
    .limit(1);

  if (active && active.length > 0) {
    throw new Error("You already have an active delivery.");
  }

  const { data, error } = await supabase
    .from("deliveries")
    .insert([{
      order_id: orderId,
      user_id: riderId,
      status: "assigned",
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// =========================
// GET RIDER ACTIVE DELIVERY
// =========================
export const getActiveDelivery = async (supabase, riderId) => {
  const { data, error } = await supabase
    .from("deliveries")
    .select(`
      *,
      order:orders (
        order_id,
        total_price,
        user_id,
        restaurants (
          name,
          profile_image,
          addresses ( house_no, street, barangay, city )
        ),
        order_items (
          quantity,
          menu_items ( name, price )
        )
      )
    `)
    .eq("user_id", riderId)
    .in("status", ["assigned", "picked_up"])
    .maybeSingle();

  if (error) throw error;

  if (!data) return null;

  // Fetch customer address separately (same pattern as storeowner fix)
  const customerId = data.order?.user_id;
  if (customerId) {
    const { data: addr } = await supabase
      .from("addresses")
      .select("house_no, street, barangay, city")
      .eq("user_id", customerId)
      .eq("is_default", true)
      .maybeSingle();

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("first_name, last_name, contact_number")
      .eq("user_id", customerId)
      .maybeSingle();

    data.customerAddress = addr;
    data.customerProfile = profile;
  }

  return data;
};

// =========================
// GET RIDER DELIVERY HISTORY
// =========================
export const getDeliveryHistory = async (supabase, riderId) => {
  const { data, error } = await supabase
    .from("deliveries")
    .select(`
      *,
      order:orders (
        order_id,
        total_price,
        restaurants ( name, profile_image )
      )
    `)
    .eq("user_id", riderId)
    .eq("status", "delivered")
    .order("delivery_time", { ascending: false });

  if (error) throw error;
  return data;
};

// =========================
// UPDATE DELIVERY STATUS
// =========================
export const updateDeliveryStatus = async (
  supabase,
  riderId,
  deliveryId,
  newStatus
) => {
  const allowed = ["picked_up", "delivered"];
  if (!allowed.includes(newStatus)) throw new Error("Invalid status.");

  const { data: delivery, error: fetchErr } = await supabase
    .from("deliveries")
    .select("delivery_id, order_id, status, user_id")
    .eq("delivery_id", deliveryId)
    .eq("user_id", riderId)
    .single();

  if (fetchErr || !delivery) throw new Error("Delivery not found.");

  const updates = { status: newStatus };
  if (newStatus === "delivered") {
    updates.delivery_time = new Date().toISOString();
    // Also mark the order as completed
    await supabase
      .from("orders")
      .update({ status: "completed" })
      .eq("order_id", delivery.order_id);
  }

  const { data, error } = await supabase
    .from("deliveries")
    .update(updates)
    .eq("delivery_id", deliveryId)
    .select()
    .single();

  if (error) throw error;
  return data;
};