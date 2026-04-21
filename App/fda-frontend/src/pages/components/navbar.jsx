import { NavLink, useNavigate } from "react-router-dom";
import {
  LuHouse,
  LuCompass,
  LuStar,
  LuShoppingCart,
  LuMail,
  LuSettings,
} from "react-icons/lu";
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase.js";

import logoMerged from "../../assets/Grubero-logo-merge-updated.png";
import DefaultProfile from "../../assets/Stock_User.jpg";
import SidebarPromoCard from "./SidebarPromoCard.jsx";

function Navbar() {
  const [user, setUser] = useState(null);
  const [showPromo, setShowPromo] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) return;

      const authUser = data.user;

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", authUser.id)
        .maybeSingle();

      setUser({
        ...authUser,
        ...(profile || {}),
      });
    };

    fetchUser();
  }, []);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg transition ${
      isActive
        ? "bg-red-600 text-white"
        : "text-gray-200 hover:bg-gray-800 hover:text-white"
    }`;

  const handleProfileClick = () => {
    if (!user) return;
    navigate(`/profile/${user.id}`);
  };

  return (
    <nav className="flex flex-col w-64 h-screen bg-gray-900 text-white p-5 shrink-0">
      {/* TOP */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <img
            src={logoMerged}
            alt="Grubero"
            className="h-10 w-auto object-contain"
          />
        </div>

        <ul className="space-y-2">
          <li>
            <NavLink to="/home" className={linkClass}>
              <LuHouse /> Home
            </NavLink>
          </li>

          <li>
            <NavLink to="/explore" className={linkClass}>
              <LuCompass /> Explore
            </NavLink>
          </li>

          <li>
            <NavLink to="/favourites" className={linkClass}>
              <LuStar /> Favourites
            </NavLink>
          </li>

          <li>
            <NavLink to="/orders" className={linkClass}>
              <LuShoppingCart /> Orders
            </NavLink>
          </li>

          <li>
            <NavLink to="/messages" className={linkClass}>
              <LuMail /> Messages
            </NavLink>
          </li>

          <li>
            <NavLink to="/settings" className={linkClass}>
              <LuSettings /> Settings
            </NavLink>
          </li>
        </ul>
      </div>

      {/* MIDDLE */}
      <div className="my-4 min-h-[250px]">
        {showPromo ? (
          <SidebarPromoCard onClose={() => setShowPromo(false)} />
        ) : (
          <div className="h-[250px]" />
        )}
      </div>

      {/* BOTTOM */}
      <div
        onClick={handleProfileClick}
        className="mt-auto border-t border-gray-700 pt-4 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition"
      >
        <div className="flex items-center gap-3">
          <img
            src={user?.profile_image || DefaultProfile}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="font-semibold">
              {user?.first_name
                ? `${user.first_name} ${user.last_name || ""}`
                : "Guest"}
            </div>
            <div className="text-sm text-gray-400">View Profile</div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;