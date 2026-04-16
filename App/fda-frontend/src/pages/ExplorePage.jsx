import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
import CartDrawer from "./components/CartDrawer";
import { storeData } from "./dummyData/storeData.js";
import { LuSearch, LuSlidersHorizontal, LuShoppingCart } from "react-icons/lu";
import "./styles/tailwind.css";

export default function ExplorePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  // ✅ CART DRAWER STATE (ADDED)
  const [cartOpen, setCartOpen] = useState(false);

  const filteredStores = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return storeData;
    return storeData.filter((s) => s.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* LEFT NAV */}
      <Navbar />

      {/* RIGHT CONTENT */}
      <main className="flex-1 overflow-auto">
        <section className="p-6 space-y-6">

          {/* TOP BAR */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full max-w-xl ml-auto">

              {/* SEARCH */}
              <div className="relative w-full">
                <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-full border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="Search restaurants..."
                />
              </div>

              {/* FILTER */}
              <button
                type="button"
                className="h-10 w-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center"
                onClick={() => alert("Filters not implemented yet")}
                title="Filters"
              >
                <LuSlidersHorizontal />
              </button>

              {/* CART BUTTON (FIXED) */}
              <button
                type="button"
                className="h-10 w-10 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center justify-center"
                onClick={() => setCartOpen(true)}
                title="Cart"
              >
                <LuShoppingCart />
              </button>

            </div>
          </div>

          {/* RESTAURANTS NEARBY */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Restaurants Nearby</h2>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                20 km ▾
              </button>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStores.map((restaurant) => (
                <li
                  key={restaurant.restaurant_id}
                  onClick={() =>
                    navigate(`/store/${restaurant.restaurant_id}`)
                  }
                  className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-lg transition"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={restaurant.image_url}
                      alt={restaurant.name}
                      className="w-16 h-16 object-contain rounded"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold truncate">
                        {restaurant.name}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* POPULAR ORDERS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Popular Orders</h2>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                Today ▾
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="h-40 rounded-xl bg-gray-100 border border-gray-200" />
              <div className="h-40 rounded-xl bg-gray-100 border border-gray-200" />
              <div className="h-40 rounded-xl bg-gray-100 border border-gray-200" />
              <div className="h-40 rounded-xl bg-gray-100 border border-gray-200" />
              <div className="h-40 rounded-xl bg-gray-100 border border-gray-200" />
              <div className="h-40 rounded-xl bg-gray-100 border border-gray-200" />
            </div>
          </div>
        </section>
      </main>

      {/* ✅ CART DRAWER */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </div>
  );
}