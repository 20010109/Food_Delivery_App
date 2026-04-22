import * as service from "./restaurant.service.js";

export const createRestaurant = async (req, res) => {
  try {
    const restaurant = await service.createRestaurant(
      req.supabase,
      req.user.id,
      req.body
    );

    res.status(201).json(restaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyRestaurants = async (req, res) => {
  try {
    const data = await service.getRestaurantsByOwner(
      req.supabase,
      req.user.id
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateRestaurant = async (req, res) => {
  try {
    // console.log("UPDATE BODY:", req.body);
    // console.log("PARAM ID:", req.params.restaurant_id);
    // console.log("USER ID:", req.user.id);

    const updated = await service.updateRestaurant(
      req.supabase,
      req.params.restaurant_id,
      req.user.id,
      req.body
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteRestaurant = async (req, res) => {
  try {
    await service.deleteRestaurant(
      req.supabase,
      req.params.restaurant_id,
      req.user.id
    );
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUBLIC (no role check needed)
export const getApprovedRestaurants = async (req, res) => {
  try {
    const data = await service.getApprovedRestaurants(req.supabase);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRestaurantById = async (req, res) => {
  try {
    const data = await service.getRestaurantById(
      req.supabase, // ✅ correct
      req.params.restaurant_id
    );

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};