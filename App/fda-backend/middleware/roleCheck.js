

export const roleCheck = (requiredRole) => {
    return async (req, res, next) => {
      try {
        const { data, error } = await req.supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", req.user.id)
          .single();
  
        if (error || !data) {
          return res.status(403).json({ error: "No profile found" });
        }
  
        if (data.role !== requiredRole) {
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