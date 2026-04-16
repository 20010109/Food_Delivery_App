import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storeData } from "../dummyData/storeData.js";
import {
  LuSearch,
  LuSlidersHorizontal,
  LuShoppingCart,
  LuMapPin,
  LuX,
  LuArrowRight,
} from "react-icons/lu";
import "../styles/tailwind.css";

import CartDrawer from "./CartDrawer";

function CustomerDashboard() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  // DYNAMIC Restaurants
  //const [restaurants, setRestaurants] = useState([]);

  // CART STATE (NEW)
  const [cartOpen, setCartOpen] = useState(false);

  // Address feature
  const [address, setAddress] = useState("");
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const categories = useMemo(
    () => ["Popular", "Chicken", "Burgers", "Pizza", "Coffee", "Milk Tea"],
    []
  );

  // useEffect(() => {
  //   const fetchRestaurants = async () => {
  //     try {
  //       const res = await fetch("http://localhost:3000/api/restaurants");
  //       const data = await res.json();
  
  //       if (!res.ok) {
  //         throw new Error(data.error || "Failed to fetch restaurants");
  //       }
  
  //       setRestaurants(data);
  //     } catch (err) {
  //       console.error("Failed to fetch restaurants:", err.message);
  //     }
  //   };
  
  //   fetchRestaurants();
  // }, []);

  // const filteredStores = useMemo(() => {
  //   const q = query.trim().toLowerCase();
  //   if (!q) return restaurants;
  //   return restaurants.filter((s) =>
  //     s.name.toLowerCase().includes(q)
  //   );
  // }, [query, restaurants]); // ✅ FIX

  const filteredStores = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return storeData;
    return storeData.filter((s) =>
      s.name.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <section className="p-6 space-y-8">

      {/* TOP BAR */}
      <div className="flex items-center justify-between gap-4">

        {/* Address button */}
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50"
          onClick={() => setIsEditingAddress(true)}
          title="Change address"
        >
          <LuMapPin className="text-gray-500" />
          <span className="font-medium">{address}</span>
        </button>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-2 w-full max-w-xl">

          {/* SEARCH */}
          <div className="relative w-full">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              placeholder="Search for anything..."
            />
          </div>

          {/* FILTER */}
          <button
            type="button"
            className="h-10 w-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center"
            onClick={() => alert("Filter modal not implemented yet")}
            title="Filters"
          >
            <LuSlidersHorizontal />
          </button>

          {/* CART BUTTON (FIXED - NOW OPENS DRAWER) */}
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

      {/* ADDRESS MODAL */}
      {isEditingAddress && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-24"
          onClick={() => setIsEditingAddress(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-full border border-gray-200 bg-white px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="Enter your address"
                />

                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setAddress("")}
                  title="Clear"
                >
                  <LuX />
                </button>
              </div>

              <button
                type="button"
                className="h-12 w-12 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center justify-center"
                onClick={() => setIsEditingAddress(false)}
                title="Save"
              >
                <LuArrowRight />
              </button>
            </div>

            {/* SAVED ADDRESSES */}
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Saved Addresses
              </p>

              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <button
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 text-left"
                  onClick={() => {
                    setAddress("Cebu, 6000");
                    setIsEditingAddress(false);
                  }}
                >
                  <div className="flex items-center gap-2 text-gray-700">
                    <LuMapPin className="text-gray-500" />
                    <span>Cebu, 6000</span>
                  </div>
                  <span className="text-green-600 font-semibold">✓</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORIES */}
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
          {filteredStores.slice(0, 6).map((restaurants) => (
            <li
              key={restaurants.restaurant_id}
              onClick={() =>
                navigate(`/store/${restaurants.restaurant_id}`)
              }
              className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
            >
              <img
                src={restaurants.image_url}
                alt={restaurants.name}
                className="w-24 h-24 object-contain rounded mb-2"
              />
              <span className="font-semibold">{restaurants.name}</span>
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

      {/* CART DRAWER (NEW) */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
      />

    </section>
  );
}

export default CustomerDashboard;