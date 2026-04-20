import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storeData } from "../dummyData/storeData.js";
import "../styles/tailwind.css";

import CategoryCarousel from "./CategoryCarousel.jsx";

import TopBar from "./TopBar.jsx";
import CartDrawer from "./CartDrawer";
import AddressModal from "./AddressModal.jsx";

const LS_ADDRESS_KEY = "grubero_address"; // shared key across pages

function CustomerDashboard() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  // CART STATE
  const [cartOpen, setCartOpen] = useState(false);

  // ADDRESS STATE
  const [address, setAddress] = useState(() => {
    return localStorage.getItem(LS_ADDRESS_KEY) || "";
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // keep localStorage in sync whenever address changes
  useEffect(() => {
    localStorage.setItem(LS_ADDRESS_KEY, address);
  }, [address]);

 

  const filteredStores = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return storeData;
    return storeData.filter((s) => s.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <section className="p-6 space-y-8">

      {/* TOP BAR */}
      <TopBar
        query={query}
        onQueryChange={setQuery}
        onOpenFilters={() => alert("Filters not implemented yet")}
        onOpenCart={() => setCartOpen(true)}
        showAddressButton={true}
        addressLabel={address || "Set address"}
        onOpenAddress={() => setIsEditingAddress(true)}
      />

      {/* ADDRESS MODAL */}
      <AddressModal
        open={isEditingAddress}
        address={address}
        setAddress={setAddress}
        onClose={() => setIsEditingAddress(false)}
        onSave={() => setIsEditingAddress(false)}
      />

            {/* CATEGORIES */}
      <CategoryCarousel />

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
          {filteredStores.slice(0, 6).map((r) => (
            <li
              key={r.restaurant_id}
              onClick={() => navigate(`/store/${r.restaurant_id}`)}
              className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
            >
              <img
                src={r.image_url}
                alt={r.name}
                className="w-24 h-24 object-contain rounded mb-2"
              />
              <span className="font-semibold">{r.name}</span>
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

      {/* CART DRAWER */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* TODO (backend/settings): Replace localStorage address with user profile address from DB */}
      {/* TODO (backend): Filters should come from API (cuisines/tags/distance/etc.) */}
    </section>
  );
}

export default CustomerDashboard;