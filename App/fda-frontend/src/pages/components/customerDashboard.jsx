import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { storeData } from "../dummyData/storeData.js";
import { LuSearch, LuSlidersHorizontal, LuShoppingCart } from "react-icons/lu";
import "../styles/tailwind.css";

function CustomerDashboard() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const categories = useMemo(
    () => ["Popular", "Chicken", "Burgers", "Pizza", "Coffee", "Milk Tea"],
    []
  );

  const filteredStores = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return storeData;
    return storeData.filter((s) => s.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <section className="p-6 space-y-8">
      {/* TOP BAR (Search + Filter + Cart only) */}
      <div className="flex items-center justify-end gap-4">
        <div className="flex items-center gap-2 w-full max-w-xl">
          <div className="relative w-full">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              placeholder="Search for anything..."
            />
          </div>

          {/* Filter button */}
          <button
            type="button"
            className="h-10 w-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center"
            onClick={() => alert("Filter modal not implemented yet")}
            title="Filters"
          >
            <LuSlidersHorizontal />
          </button>

          {/* Cart button */}
          <button
            type="button"
            className="h-10 w-10 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center justify-center"
            onClick={() => navigate("/orders")}
            title="Cart / Orders"
          >
            <LuShoppingCart />
          </button>
        </div>
      </div>

      {/* EXPLORE CATEGORIES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Explore Categories</h2>
          <button className="text-sm text-gray-500 hover:text-gray-700">
            See all
          </button>
        </div>

        <div className="grid grid-cols-6 gap-4">
          {categories.map((c) => (
            <button
              key={c}
              className="h-24 rounded-xl bg-gray-100 border border-gray-200 hover:bg-gray-200 transition text-sm font-medium text-gray-700"
              onClick={() => alert(`Category clicked: ${c}`)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* FEATURED STORES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Featured Stores</h2>

         <button
           className="text-sm text-gray-500 hover:text-gray-700"
          onClick={() => navigate("/explore")}
         >
            See all
         </button>
        </div>

        <ul className="grid grid-cols-3 gap-4">
          {filteredStores.slice(0, 6).map((restaurant) => (
            <li
              key={restaurant.restaurant_id}
              onClick={() => navigate(`/store/${restaurant.restaurant_id}`)}
              className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
            >
              <img
                src={restaurant.image_url}
                alt={restaurant.name}
                className="w-24 h-24 object-contain rounded mb-2"
              />
              <span className="font-semibold">{restaurant.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ORDER AGAIN */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Order Again</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-40 rounded-xl bg-gray-100 border border-gray-200" />
          <div className="h-40 rounded-xl bg-gray-100 border border-gray-200" />
          <div className="h-40 rounded-xl bg-gray-100 border border-gray-200" />
        </div>
      </div>
    </section>
  );
}

export default CustomerDashboard;