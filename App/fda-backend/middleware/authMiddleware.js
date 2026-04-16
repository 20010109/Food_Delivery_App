import { createClient } from "@supabase/supabase-js";

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  // 🔥 IMPORTANT: no token argument here
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    console.log("AUTH ERROR:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.user = data.user;
  req.supabase = supabase;

  console.log("AUTH SUCCESS:", req.user.id);

  next();
};