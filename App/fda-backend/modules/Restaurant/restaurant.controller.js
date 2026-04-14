import * as service from "./restaurant.service.js";

export const createRestaurant = async (req, res) => {
  try {
    const restaurant = await service.createRestaurant(req, req.body);
    res.status(201).json(restaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyRestaurants = async (req, res) => {
    try {
      const data = await service.getRestaurantsByOwner(req.user.id);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

export const updateRestaurant = async (req, res) => {
  try {
    const updated = await service.updateRestaurant(
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
    await service.deleteRestaurant(req.params.restaurant_id, req.user.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getApprovedRestaurants = async (req, res) => {
    try {
      const data = await service.getApprovedRestaurants();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };