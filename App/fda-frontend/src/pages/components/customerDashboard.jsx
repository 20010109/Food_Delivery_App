import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storeData } from "../dummyData/storeData.js";
import "../styles/tailwind.css";

import CategoryCarousel from "./CategoryCarousel.jsx";
import TopBar from "./TopBar.jsx";
import CartDrawer from "./CartDrawer";
import AddressModal from "./AddressModal.jsx";
import { getPrimaryAddress } from "../../utils/addressApi.js";

function CustomerDashboard() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const [cartOpen, setCartOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  useEffect(() => {
    const loadAddress = async () => {
      try {
        const current = await getPrimaryAddress();
        setAddress(current?.address_line || "");
      } catch (err) {
        console.error("Failed to load address:", err.message);
      }
    };

    loadAddress();
  }, []);

  const filteredStores = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return storeData;
    return storeData.filter((s) => s.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <section className="p-6 space-y-8">
      <TopBar
        query={query}
        onQueryChange={setQuery}
        onOpenFilters={() => alert("Filters not implemented yet")}
        onOpenCart={() => setCartOpen(true)}
        showAddressButton={true}
        addressLabel={address || "Set address"}
        onOpenAddress={() => setIsEditingAddress(true)}
      />

      <AddressModal
        open={isEditingAddress}
        address={address}
        setAddress={setAddress}
        onClose={() => setIsEditingAddress(false)}
        onSave={(newAddress) => {
          setAddress(newAddress);
          setIsEditingAddress(false);
        }}
      />

      <CategoryCarousel />

      {/* FEATURED STORES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Featured Stores</h2>
          <button
            className="text-sm text-gray-500 hover:text-gray-700"
            onClick={() => navigate("/explore")}
          >
            See all
          </button>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredStores.slice(0, 6).map((r) => (
            <li
              key={r.restaurant_id}
              onClick={() => navigate(`/store/${r.restaurant_id}`)}
              className="bg-white rounded-2xl border border-gray-200 p-4 cursor-pointer hover:shadow-md transition"
            >
              <div className="flex gap-4">
                <img
                  src={r.image_url}
                  alt={r.name}
                  className="w-24 h-24 object-contain rounded-xl bg-gray-50 border border-gray-100 p-2 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                        {r.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {r.cuisine} • {r.price_range}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
                    <span>⭐ {r.rating}</span>
                    <span>({r.reviews})</span>
                    <span>{r.delivery_time}</span>
                  </div>

                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
                    <span>{r.delivery_fee}</span>
                    <span>{r.distance}</span>
                  </div>

                  {r.promo_tag && (
                    <div className="mt-3">
                      <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                        {r.promo_tag}
                      </span>
                    </div>
                  )}
                </div>
              </div>
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

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </section>
  );
}

export default CustomerDashboard;