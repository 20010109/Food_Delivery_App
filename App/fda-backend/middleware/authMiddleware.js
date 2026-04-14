//for using auth of supabase

import { supabase } from "../config/supabase.js";
import { createClient } from "@supabase/supabase-js";

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token" });

  const { data, error } = await supabase.auth.getUser(token);

  if (error) return res.status(401).json({ error: "Unauthorized" });

  req.user = data.user;

  // console.log("AUTH USER:", req.user);

  req.supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  next();
};