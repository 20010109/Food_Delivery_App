import { NavLink } from "react-router-dom";
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

import ProfilePicture from "../../assets/Stock_User.jpg"

// IMPORTANT: set this import to your merged logo filename exactly
import logo from "../../assets/grubero-logo-merge-updated.png";

function Navbar() {
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg transition
     ${
       isActive
         ? "bg-red-600 text-white"
         : "text-gray-200 hover:bg-gray-800 hover:text-white"
     }`;

  const [user, setUser] = useState(null);



  return (
    <nav className="flex flex-col w-64 h-screen bg-gray-900 text-white p-6">
      <div className="mb-8">
        {/* LOGO AREA (merged icon + text) */}
        <div className="mb-6">
          <img
            src={logo}
            alt="Grubero"
            className="h-12 w-auto object-contain"
          />
        </div>

        <ul className="space-y-2">
          <li>
            <NavLink to="/home" className={linkClass}>
              <LuHouse />
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/explore" className={linkClass}>
              <LuCompass />
              Explore
            </NavLink>
          </li>
          <li>
            <NavLink to="/favourites" className={linkClass}>
              <LuStar />
              Favourites
            </NavLink>
          </li>
          <li>
            <NavLink to="/orders" className={linkClass}>
              <LuShoppingCart />
              Orders
            </NavLink>
          </li>
          <li>
            <NavLink to="/messages" className={linkClass}>
              <LuMail />
              Messages
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" className={linkClass}>
              <LuSettings />
              Settings
            </NavLink>
          </li>
        </ul>
      </div>

      {/* PROFILE AREA */}
      <div className="mt-auto flex items-center gap-3 border-t border-gray-700 pt-4">
        <img
          src={ProfilePicture}
          alt="Profile"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <div className="font-semibold">Jessica Codilla</div>
          <NavLink
            to={user ? `/profile/${user.id}` : "/login"}
            className="text-sm text-gray-400 hover:underline focus:outline-none"
          >
            View Profile
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;