import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuSettings, LuChevronDown, LuLogOut, LuUser } from "react-icons/lu";
import { supabase } from "../../../utils/supabase.js";
import DefaultProfile from "../../../assets/Stock_User.jpg";

function AdminNavbar({ adminName = "Admin", pageTitle = "Dashboard" }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shrink-0 relative">

      {/* LEFT — page title + subtitle */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
        <p className="text-sm text-gray-400">Welcome back, {adminName}!</p>
      </div>

      {/* RIGHT — settings + profile */}
      <div className="flex items-center gap-4">

        {/* Settings icon */}
        <div
          className="cursor-pointer"
          onClick={() => navigate("/admin/settings")}
        >
          <LuSettings size={20} className="text-gray-500 hover:text-red-600 transition" />
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-100" />

        {/* Profile dropdown trigger */}
        <div
          className="flex items-center gap-3 cursor-pointer relative"
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          <img
            src={DefaultProfile}
            alt="Admin"
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-gray-800">{adminName}</p>
            <p className="text-xs text-gray-400">Admin</p>
          </div>
          <LuChevronDown size={16} className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-12 bg-white border border-gray-100 rounded-2xl shadow-lg w-48 z-50 overflow-hidden">
              <button
                onClick={() => navigate("/admin/profile")}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
              >
                <LuUser size={15} /> My Profile
              </button>
              <button
                onClick={() => navigate("/admin/settings")}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
              >
                <LuSettings size={15} /> Settings
              </button>
              <div className="border-t border-gray-100" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition"
              >
                <LuLogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default AdminNavbar;