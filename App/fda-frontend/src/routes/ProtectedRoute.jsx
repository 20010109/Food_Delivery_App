import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ allowedRoles }) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

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
        .select("role")
        .eq("user_id", data.user.id)
        .single();

      setRole(profile?.role);
      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) return null;

  if (!role) return <Navigate to="/login" />;

  // 🔐 ROLE CHECK
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/home" />;
  }

  return <Outlet />;
}