//for using auth of supabase

import { supabase } from "../config/supabase.js";

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token" });

  const { data, error } = await supabase.auth.getUser(token);

  if (error) return res.status(401).json({ error: "Unauthorized" });

  req.user = data.user;
  next();
};