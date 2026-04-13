import { LuHouse } from "react-icons/lu";
import { LuCompass } from "react-icons/lu";
import { LuStar } from "react-icons/lu";
import { LuShoppingCart } from "react-icons/lu";
import { LuMail } from "react-icons/lu";
import { LuSettings } from "react-icons/lu";

function Navbar() {
    return (
      <nav className="flex flex-col w-64 h-screen bg-gray-900 text-white p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">AppName</h2>
          <ul className="space-y-4">
            <li>
              <a href="#" className="flex items-center gap-2 hover:text-blue-400">
                <LuHouse/>
                Home
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-2 hover:text-blue-400">
                <LuCompass/>
                Explore
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-2 hover:text-blue-400">
                <LuStar/>
                Favourites
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-2 hover:text-blue-400">
                <LuShoppingCart/>
                Orders
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-2 hover:text-blue-400">
                <LuMail/>
                Messages
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-2 hover:text-blue-400">
                <LuSettings/>
                Settings
              </a>
            </li>
          </ul>
        </div>
        <div className="mt-auto flex items-center gap-3 border-t border-gray-700 pt-4">
          <img
            src="https://via.placeholder.com/40"
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <div className="font-semibold">John Doe</div>
            <div className="text-sm text-gray-400">View Profile</div>
          </div>
        </div>
      </nav>
    );
  }
  
  export default Navbar;