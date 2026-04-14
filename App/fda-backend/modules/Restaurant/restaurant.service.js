const TABLE = "restaurants";

export const createRestaurant = async (req, payload) => {
  // 1. Check Supabase auth (for debugging only)
  const { data: authData, error: authError } =
    await req.supabase.auth.getUser();

  console.log("SUPABASE AUTH CHECK:", authData);
  console.log("AUTH ERROR:", authError);

  // 2. Insert restaurant
  const { data, error } = await req.supabase
    .from(TABLE)
    .insert([
      {
        ...payload,
        user_id: req.user.id, // backend-controlled (correct)
        status: "pending"
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("INSERT ERROR:", error);
    throw error;
  }

  return data;
};

export const getRestaurantsByOwner = async (req) => {
  const { data, error } = await req.supabase
    .from("restaurants")
    .select("*")
    .eq("user_id", req.user.id);

  if (error) throw error;
  return data;
};

export const updateRestaurant = async (req, restaurantId, payload) => {
  const { data, error } = await req.supabase
    .from("restaurants")
    .update(payload)
    .eq("restaurant_id", restaurantId)
    .eq("user_id", req.user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteRestaurant = async (req, id) => {
  const { error } = await req.supabase
    .from("restaurants")
    .delete()
    .eq("restaurant_id", id)
    .eq("user_id", req.user.id);

  if (error) throw error;
};

export const getApprovedRestaurants = async () => {
    const { data, error } = req.supabase
      .from(TABLE)
      .select("*")
      .eq("status", "approved");
  
    if (error) throw error;
    return data;
  };