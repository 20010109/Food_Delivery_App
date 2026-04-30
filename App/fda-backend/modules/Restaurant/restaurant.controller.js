import * as service from "./restaurant.service.js";
import { supabase } from "../../config/supabase.js";

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
// export const getApprovedRestaurants = async (req, res) => {
//   try {
//     const data = await service.getApprovedRestaurants(req.supabase);
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

export const getApprovedRestaurants = async (req, res) => {
  try {
    const { data, error } = await supabase.rpc(
      "get_restaurants_with_details"
    );

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRestaurantById = async (req, res) => {
  try {
    const data = await service.getRestaurantById(
      supabase,
      req.params.restaurant_id
    );

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllRestaurants = async (req, res) => {
  try {
    const data = await service.getAllRestaurants(req.supabase);
    //console.log("ADMIN RESTAURANTS:", JSON.stringify(data, null, 2));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateRestaurantStatus = async (req, res) => {
  try {
    const updated = await service.updateRestaurantStatus(
      req.supabase,
      req.params.restaurant_id,   
      req.body.status             
    );

    res.json(updated);
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

export const applyStoreOwner = async (req, res) => {
  try {
    const userId = req.user.id;
    const supabase = req.supabase; // or however you inject it

    const { name, contact_info, address_id, profile_image, background_image } =
      req.body;

    // 1. Check if user already has a restaurant
    const { data: existing } = await supabase
      .from("restaurants")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (existing) {
      return res.status(400).json({
        error: "You already have a restaurant or pending application",
      });
    }

    // 2. Insert as PENDING application
    const { data, error } = await supabase
      .from("restaurants")
      .insert([
        {
          user_id: userId,
          name,
          contact_info,
          address_id,
          profile_image,
          background_image,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};