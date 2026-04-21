import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import CartDrawer from "./components/CartDrawer";
import TopBar from "./components/TopBar.jsx";
import AddressModal from "./components/AddressModal.jsx";
import { storeData } from "./dummyData/storeData.js";
import { menuData } from "./dummyData/menuData.js";
import { getPrimaryAddress } from "../utils/addressApi.js";
import "./styles/tailwind.css";

export default function ExplorePage() {
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

  const popularOrders = useMemo(() => {
    const merged = menuData
      .map((item, index) => {
        const restaurant = storeData.find(
          (store) => store.restaurant_id === item.restaurant_id
        );

        if (!restaurant) return null;

        return {
          ...item,
          restaurant,
          fakeOrders: 900 + index * 87,
          badge:
            restaurant.promo_tag ||
            (index % 2 === 0 ? "Free delivery" : "Best seller"),
        };
      })
      .filter(Boolean);

    if (!query.trim()) return merged.slice(0, 6);

    const q = query.trim().toLowerCase();
    return merged.filter((item) => {
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.restaurant.name.toLowerCase().includes(q) ||
        item.restaurant.cuisine.toLowerCase().includes(q)
      );
    });
  }, [query]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1 overflow-auto">
        <section className="p-6 space-y-6">
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

          {/* RESTAURANTS NEARBY */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Restaurants Nearby
              </h2>

              <button className="text-sm text-gray-500 hover:text-gray-700">
                20 km ▾
              </button>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredStores.map((restaurant) => (
                <li
                  key={restaurant.restaurant_id}
                  onClick={() => navigate(`/store/${restaurant.restaurant_id}`)}
                  className="bg-white rounded-2xl border border-gray-200 p-4 cursor-pointer hover:shadow-md transition"
                >
                  <div className="flex gap-4">
                    <img
                      src={restaurant.image_url}
                      alt={restaurant.name}
                      className="w-24 h-24 object-contain rounded-xl bg-gray-50 border border-gray-100 p-2 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 leading-tight truncate">
                        {restaurant.name}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        {restaurant.cuisine} • {restaurant.price_range}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
                        <span>⭐ {restaurant.rating}</span>
                        <span>({restaurant.reviews})</span>
                        <span>{restaurant.delivery_time}</span>
                      </div>

                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
                        <span>{restaurant.delivery_fee}</span>
                        <span>{restaurant.distance}</span>
                      </div>

                      {restaurant.promo_tag && (
                        <div className="mt-3">
                          <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                            {restaurant.promo_tag}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* POPULAR ORDERS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Popular Orders
              </h2>

              <button className="text-sm text-gray-500 hover:text-gray-700">
                Today ▾
              </button>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {popularOrders.map((item) => (
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
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 leading-tight truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 truncate">
                          {item.restaurant.name}
                        </p>
                      </div>

                      <span className="shrink-0 inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                        {item.badge}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
                      <span>⭐ {item.restaurant.rating}</span>
                      <span>({item.fakeOrders})</span>
                      <span>{item.restaurant.cuisine}</span>
                    </div>

                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
                      <span>₱{item.price}</span>
                      <span>{item.restaurant.delivery_time}</span>
                      <span>{item.restaurant.delivery_fee}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}