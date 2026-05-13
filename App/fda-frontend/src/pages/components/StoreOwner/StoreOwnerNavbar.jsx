import { LuRefreshCw } from "react-icons/lu";

const TAB_TITLES = {
  overview: "Dashboard",
  menu:     "Menu Management",
  orders:   "Orders",
};

function StoreOwnerNavbar({ activeTab, restaurantName, onRefresh }) {
  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {TAB_TITLES[activeTab] || "Dashboard"}
        </h1>
        <p className="text-sm text-gray-400">{restaurantName || "Your Store"}</p>
      </div>

      {onRefresh && (
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-xl px-3 py-2 transition hover:border-gray-400"
        >
          <LuRefreshCw size={14} /> Refresh
        </button>
      )}
    </header>
  );
}

export default StoreOwnerNavbar;
