import { supabaseAdmin } from "../../config/supabase.js";

export const deleteUserById = async (userId) => {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw error;
};
