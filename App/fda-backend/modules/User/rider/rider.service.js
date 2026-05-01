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
  user_id,
  status
) => {
  const allowed = ["pending", "approved", "rejected"];

  if (!allowed.includes(status)) {
    throw new Error("Invalid verification status");
  }

  const { data, error } = await supabase
    .from("rider_profiles")
    .update({ verification_status: status })
    .eq("user_id", user_id)
    .select()
    .single();

  if (error) throw error;
  return data;
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