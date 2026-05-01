import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ allowedRoles }) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role, is_active")
        .eq("user_id", data.user.id)
        .single();

      setRole(profile?.role);
      setIsActive(profile?.is_active ?? true);

      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) return null;

  // 🚫 Not logged in
  if (!role) return <Navigate to="/login" />;

  // 🚫 Banned user
  if (!isActive) return <Navigate to="/banned" />;

  // 🔐 Role-based protection
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/home" />;
  }

  return <Outlet />;
}