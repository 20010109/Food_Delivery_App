import {
  createRiderProfile,
  getRiderProfile,
  updateRiderProfile,
  updateRiderAvailability,
  updateRiderVerificationStatus,
  getAllRiders,
} from "./rider.service.js";

// =========================
// CREATE RIDER PROFILE (ONBOARDING)
// =========================
export const handleCreateRiderProfile = async (req, res) => {
  try {
    const user_id = req.user.id; // from auth middleware
    const {
      vehicle_type,
      vehicle_plate_number,
      license_number,
      or_code,
      cr_code,
    } = req.body;

    if (!vehicle_type) {
      return res.status(400).json({ error: "Vehicle type is required" });
    }

    const rider = await createRiderProfile(req.supabase, {
      user_id,
      vehicle_type,
      vehicle_plate_number,
      license_number,
      or_code,
      cr_code,
    });

    return res.status(201).json(rider);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// =========================
// GET RIDER PROFILE (SELF)
// =========================
export const handleGetRiderProfile = async (req, res) => {
  try {
    const user_id = req.user.id;

    const rider = await getRiderProfile(req.supabase, user_id);

    return res.status(200).json(rider);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// =========================
// UPDATE RIDER PROFILE
// =========================
export const handleUpdateRiderProfile = async (req, res) => {
  try {
    const user_id = req.user.id;

    const updated = await updateRiderProfile(
      req.supabase,
      user_id,
      req.body
    );

    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// =========================
// UPDATE AVAILABILITY
// =========================
export const handleUpdateAvailability = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { status } = req.body;

    const updated = await updateRiderAvailability(
      req.supabase,
      user_id,
      status
    );

    return res.status(200).json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// =========================
// ADMIN: UPDATE VERIFICATION STATUS
// =========================
export const handleUpdateVerificationStatus = async (req, res) => {
  try {
    const { rider_id, status } = req.body;

    if (!rider_id || !status) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const data = await updateRiderVerificationStatus(
      req.supabase,
      rider_id,
      status
    );

    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// =========================
// ADMIN: GET ALL RIDERS
// =========================
export const handleGetAllRiders = async (req, res) => {
  try {
    const riders = await getAllRiders(req.supabase);

    return res.status(200).json(riders);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


import {
  getAvailableOrders,
  claimDelivery,
  getActiveDelivery,
  getDeliveryHistory,
  updateDeliveryStatus,
} from "./rider.service.js";

export const handleGetAvailableOrders = async (req, res) => {
  try {
    const data = await getAvailableOrders(req.supabase);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const handleClaimDelivery = async (req, res) => {
  try {
    const riderId = req.user.id;
    const { order_id } = req.body;
    if (!order_id) return res.status(400).json({ error: "order_id required" });
    const data = await claimDelivery(req.supabase, riderId, order_id);
    return res.status(201).json(data);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const handleGetActiveDelivery = async (req, res) => {
  try {
    const data = await getActiveDelivery(req.supabase, req.user.id);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const handleGetDeliveryHistory = async (req, res) => {
  try {
    const data = await getDeliveryHistory(req.supabase, req.user.id);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const handleUpdateDeliveryStatus = async (req, res) => {
  try {
    const riderId = req.user.id;
    const { delivery_id, status } = req.body;
    if (!delivery_id || !status)
      return res.status(400).json({ error: "delivery_id and status required" });
    const data = await updateDeliveryStatus(req.supabase, riderId, delivery_id, status);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};