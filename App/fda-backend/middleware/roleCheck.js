export const roleCheck = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.supabase) {
        return res.status(500).json({ error: "Supabase not initialized" });
      }

      if (!req.user?.id) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { data, error } = await req.supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", req.user.id)
        .maybeSingle();

        console.log("Role check in use...")

        // console.log("ROLE CHECK DEBUG:");
        // console.log("USER ID:", req.user.id);
        // console.log("DATA:", data);
        // console.log("ERROR:", error);
        // const test = await req.supabase.auth.getUser();
        // console.log("AUTH INSIDE SUPABASE:", test);

      if (error || !data) {
        return res.status(403).json({ error: "No profile found" });
      }

      // FIX: support array properly
      if (!requiredRoles.includes(data.role)) {
        return res.status(403).json({
          error: "Access denied",
          roleFound: data.role
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  };
};