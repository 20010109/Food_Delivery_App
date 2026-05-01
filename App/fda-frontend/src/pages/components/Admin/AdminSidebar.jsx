import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase.js";

import {
  LuLayoutDashboard,
  LuStore,
  LuUsers,
  LuShoppingCart,
  LuCreditCard,
  LuTruck,
  LuStar,
  LuChartLine,
  LuBike,
} from "react-icons/lu";

import DefaultProfile from "../../../assets/Stock_User.jpg";

function AdminSidebar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) return;

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", data.user.id)
        .maybeSingle();

      setUser({
        ...data.user,
        ...(profile || {}),
      });
    };

    fetchUser();
  }, []);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg transition ${
      isActive
        ? "bg-red-600 text-white"
        : "text-gray-500 hover:bg-red-50 hover:text-red-600"
    }`;

  const handleProfileClick = () => {
    if (!user) return;
    navigate(`/profile/${user.id}`);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 text-gray-800 p-5 flex flex-col h-screen">

      {/* HEADER */}
      <h2 className="text-xl font-bold mb-6 text-gray-800">
        Admin Panel
      </h2>

      {/* NAV */}
      <nav className="space-y-2 text-sm flex-1">

        <NavLink to="/admin" end className={linkClass}>
          <LuLayoutDashboard /> Dashboard
        </NavLink>

        <NavLink to="/admin/restaurants" className={linkClass}>
          <LuStore /> Restaurants
        </NavLink>
        
        <NavLink to="/admin/riders" className={linkClass}>
          <LuBike /> Riders
        </NavLink>

        <NavLink to="/admin/users" className={linkClass}>
          <LuUsers /> Users
        </NavLink>

        <NavLink to="/admin/analytics" className={linkClass}>
          <LuChartLine /> Analytics
        </NavLink>

        <NavLink to="/admin/orders" className={linkClass}>
          <LuShoppingCart /> Orders
        </NavLink>

        <NavLink to="/admin/payments" className={linkClass}>
          <LuCreditCard /> Payments
        </NavLink>

        <NavLink to="/admin/deliveries" className={linkClass}>
          <LuTruck /> Deliveries
        </NavLink>

        <NavLink to="/admin/reviews" className={linkClass}>
          <LuStar /> Reviews
        </NavLink>

      </nav>

      {/* PROFILE SECTION */}
      <div
        onClick={handleProfileClick}
        className="mt-auto border-t border-gray-100 pt-4 cursor-pointer hover:bg-red-50 p-2 rounded-lg transition"
      >
        <div className="flex items-center gap-3">

          <img
            src={user?.profile_image || DefaultProfile}
            alt="Admin"
            className="w-10 h-10 rounded-full object-cover"
          />

          <div>
            <div className="font-semibold text-sm text-gray-800">
              {user?.first_name
                ? `${user.first_name} ${user.last_name || ""}`
                : "Admin"}
            </div>

            <div className="text-xs text-gray-400">
              System Administrator
            </div>
          </div>

        </div>
      </div>

    </aside>
  );
}

export default AdminSidebar;