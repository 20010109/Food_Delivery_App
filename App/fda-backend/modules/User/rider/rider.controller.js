import {
  createRiderProfile,
  getRiderProfile,
  updateRiderProfile,
  updateRiderAvailability,
  updateRiderVerificationStatus,
  getAllRiders,
} from "../services/rider.service.js";

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
    const { user_id, status } = req.body;

    const updated = await updateRiderVerificationStatus(
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