import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storeData } from "../dummyData/storeData.js";
import { menuData } from "../dummyData/menuData.js";
import "../styles/tailwind.css";

import CategoryCarousel from "./CategoryCarousel.jsx";
import TopBar from "./TopBar.jsx";
import CartDrawer from "./CartDrawer.jsx";
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

    return storeData.filter((s) => {
      return (
        s.name.toLowerCase().includes(q) ||
        s.cuisine?.toLowerCase().includes(q) ||
        s.promo_tag?.toLowerCase().includes(q)
      );
    });
  }, [query]);

  const orderAgainItems = useMemo(() => {
    const merged = menuData
      .map((item, index) => {
        const restaurant = storeData.find(
          (store) => store.restaurant_id === item.restaurant_id
        );

        if (!restaurant) return null;

        return {
          ...item,
          restaurant,
          lastOrderedLabel:
            index % 3 === 0
              ? "Ordered last week"
              : index % 3 === 1
              ? "Ordered 3 days ago"
              : "Ordered recently",
        };
      })
      .filter(Boolean);

    if (!query.trim()) return merged.slice(0, 3);

    const q = query.trim().toLowerCase();
    return merged.filter((item) => {
      return (
        item.name.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.restaurant.name.toLowerCase().includes(q)
      );
    });
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Featured Stores</h2>
          <button
            className="text-sm text-red-500 hover:text-red-700"
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
                  <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                    {r.name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {r.cuisine} • {r.price_range}
                  </p>

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

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Order Again</h2>

        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {orderAgainItems.map((item) => (
            <li
              key={item.item_id}
              onClick={() => navigate(`/store/${item.restaurant_id}`)}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition"
            >
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-48 object-cover"
              />

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 leading-tight truncate">
                  {item.name}
                </h3>

                <p className="text-sm text-gray-500 mt-1 truncate">
                  {item.restaurant.name}
                </p>

                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
                  <span>₱{item.price}</span>
                  <span>{item.prep_time || item.restaurant.delivery_time}</span>
                  {item.category && <span>{item.category}</span>}
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {item.lastOrderedLabel}
                  </span>

                  {item.badge && (
                    <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </section>
  );
}

export default CustomerDashboard;