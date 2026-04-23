import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoHeart, IoHeartOutline } from "react-icons/io5";
import Navbar from "./components/Navbar.jsx";
import CartDrawer from "./components/CartDrawer";
import TopBar from "./components/TopBar.jsx";
import AddressModal from "./components/AddressModal.jsx";
import { storeData } from "./dummyData/storeData.js";
import { menuData } from "./dummyData/menuData.js";
import { getPrimaryAddress } from "../utils/addressApi.js";
import "./styles/tailwind.css";
import SearchFiltersModal from "./components/SearchFiltersModal.jsx";

const LS_FAV_STORES_KEY = "favStores";
const LS_FAV_DISHES_KEY = "favDishes";

function readLSArray(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function ExplorePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const [cartOpen, setCartOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [favStoreIds, setFavStoreIds] = useState(() =>
    readLSArray(LS_FAV_STORES_KEY)
  );
  const [favDishIds, setFavDishIds] = useState(() =>
    readLSArray(LS_FAV_DISHES_KEY)
  );
  const [filters, setFilters] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const toggleStoreFavorite = (restaurantId) => {
    setFavStoreIds((prev) => {
      const next = prev.includes(restaurantId)
        ? prev.filter((id) => id !== restaurantId)
        : [...prev, restaurantId];

      localStorage.setItem(LS_FAV_STORES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const toggleDishFavorite = (itemId) => {
    setFavDishIds((prev) => {
      const next = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];

      localStorage.setItem(LS_FAV_DISHES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const filteredStores = useMemo(() => {
    const q = query.trim().toLowerCase();
    let results = storeData;

    if (filters.cuisine) {
      results = results.filter((s) => s.cuisine === filters.cuisine);
    }

    if (filters.priceRange) {
      results = results.filter((s) => s.price_range === filters.priceRange);
    }

    if (filters.deliveryTime) {
      results = results.filter((s) => s.delivery_time === filters.deliveryTime);
    }

    if (q) {
      results = results.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.cuisine?.toLowerCase().includes(q) ||
        s.promo_tag?.toLowerCase().includes(q)
      );
    }

    return results;
  }, [query, filters]);

  const popularOrders = useMemo(() => {
    const merged = menuData
      .map((item) => {
        const restaurant = storeData.find(
          (store) => store.restaurant_id === item.restaurant_id
        );

        if (!restaurant) return null;

        return {
          ...item,
          restaurant,
        };
      })
      .filter(Boolean);

    if (!query.trim()) return merged.slice(0, 6);

    const q = query.trim().toLowerCase();
    return merged.filter((item) => {
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
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
            onOpenFilters={() => setFiltersOpen(true)}
            onOpenCart={() => setCartOpen(true)}
            showAddressButton={true}
            addressLabel={address || "Set address"}
            onOpenAddress={() => setIsEditingAddress(true)}
          />

          <SearchFiltersModal
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            onApplyFilters={setFilters}
            initialFilters={filters}
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
              {filteredStores.map((restaurant) => {
                const isFav = favStoreIds.includes(restaurant.restaurant_id);

                return (
                  <li
                    key={restaurant.restaurant_id}
                    onClick={() => navigate(`/store/${restaurant.restaurant_id}`)}
                    className="relative bg-white rounded-2xl border border-gray-200 p-4 cursor-pointer hover:shadow-md transition"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStoreFavorite(restaurant.restaurant_id);
                      }}
                      className="absolute top-3 right-3 z-10 h-10 w-10 rounded-full bg-white/95 border border-gray-200 shadow-sm hover:bg-gray-50 flex items-center justify-center"
                      aria-label={
                        isFav ? "Remove from favourites" : "Add to favourites"
                      }
                    >
                      {isFav ? (
                        <IoHeart className="text-red-500 text-xl" />
                      ) : (
                        <IoHeartOutline className="text-gray-400 text-xl" />
                      )}
                    </button>

                    <div className="flex gap-4 pr-10">
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
                );
              })}
            </ul>
          </div>

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
              {popularOrders.map((item) => {
                const isFav = favDishIds.includes(item.item_id);

                return (
                  <li
                    key={item.item_id}
                    onClick={() => navigate(`/store/${item.restaurant_id}`)}
                    className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDishFavorite(item.item_id);
                      }}
                      className="absolute top-3 right-3 z-10 h-10 w-10 rounded-full bg-white/95 border border-gray-200 shadow-sm hover:bg-gray-50 flex items-center justify-center"
                      aria-label={
                        isFav ? "Remove from favourites" : "Add to favourites"
                      }
                    >
                      {isFav ? (
                        <IoHeart className="text-red-500 text-xl" />
                      ) : (
                        <IoHeartOutline className="text-gray-400 text-xl" />
                      )}
                    </button>

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
                        <span>⭐ {item.rating}</span>
                        <span>({item.reviews})</span>
                        <span>{item.category}</span>
                      </div>

                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
                        <span>₱{item.price}</span>
                        <span>{item.prep_time}</span>
                        <span>{item.restaurant.delivery_fee}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </main>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}