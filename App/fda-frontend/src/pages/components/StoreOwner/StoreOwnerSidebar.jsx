import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase.js";
import {
  LuLayoutDashboard,
  LuUtensilsCrossed,
  LuShoppingBag,
  LuLogOut,
  LuChartBar,
} from "react-icons/lu";
import DefaultProfile from "../../../assets/Stock_User.jpg";

const NAV_ITEMS = [
  { key: "overview",  label: "Overview",  icon: LuLayoutDashboard },
  { key: "analytics", label: "Analytics", icon: LuChartBar },
  { key: "menu",      label: "Menu",      icon: LuUtensilsCrossed },
  { key: "orders",    label: "Orders",    icon: LuShoppingBag },
];

function StoreOwnerSidebar({ activeTab, setActiveTab }) {
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
      setUser({ ...data.user, ...(profile || {}) });
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("grubero_user_profile");
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 p-5 flex flex-col h-screen shrink-0">

      {/* HEADER */}
      <h2 className="text-xl font-bold mb-6 text-gray-800">Store Panel</h2>

      {/* NAV */}
      <nav className="space-y-1 text-sm flex-1">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition text-left font-medium ${
              activeTab === key
                ? "bg-red-600 text-white shadow-sm"
                : "text-gray-500 hover:bg-red-50 hover:text-red-600"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      {/* PROFILE + LOGOUT */}
      <div className="mt-auto border-t border-gray-100 pt-4 space-y-2">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg">
          <img
            src={user?.profile_image || DefaultProfile}
            alt="Profile"
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-400">Store Owner</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
        >
          <LuLogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

export default StoreOwnerSidebar;
