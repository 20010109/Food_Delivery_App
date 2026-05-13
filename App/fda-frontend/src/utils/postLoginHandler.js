import { supabase } from "./supabase.js";

/**
 * Shared post-login logic for both email/password and OAuth flows
 * Checks user profile, verifies not banned, and routes to appropriate page
 */
export const handlePostLogin = async (user, navigate) => {
  if (!user?.id) {
    throw new Error("No user data available");
  }

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    navigate("/usersetup");
    return;
  }

  // Check if user is banned
  if (profile.is_active === false) {
    await supabase.auth.signOut();
    navigate("/banned");
    return;
  }

  // Route based on role
  switch (profile.role) {
    case "admin":
      navigate("/admin");
      break;
    case "storeowner":
      navigate("/storeowner/home");
      break;
    case "rider":
      navigate("/rider/dashboard");
      break;
    case "customer":
    default:
      navigate("/home");
      break;
  }
};
