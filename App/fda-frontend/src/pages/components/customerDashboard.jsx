import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoHeart, IoHeartOutline } from "react-icons/io5";
import { LuStar } from "react-icons/lu";
import "../styles/tailwind.css";

import CategoryCarousel from "./CategoryCarousel.jsx";
import TopBar from "./TopBar.jsx";
import CartDrawer from "./CartDrawer.jsx";
import AddressModal from "./HomeAddressModal.jsx";
import SavedAddressModal from "./SavedAddressModal.jsx";
import SearchFiltersModal from "./SearchFiltersModal.jsx";

import { getPrimaryAddress } from "../../utils/addressApi.js";
import { getWalletBalance } from "../../utils/walletApi.js";
import { LuWallet } from "react-icons/lu";

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

function toKey(value) {
  return String(value ?? "");
}

function renderStarRating(rating) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <LuStar
          key={star}
          size={14}
          className={star <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
        />
      ))}
      <span className="text-xs font-semibold text-gray-700 ml-1">
        {Number(rating || 0).toFixed(1)}
      </span>
    </div>
  );
}

function CustomerDashboard() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  const [address, setAddress] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [isAddressListOpen, setIsAddressListOpen] = useState(false);

  const [favStoreIds, setFavStoreIds] = useState(() =>
    readLSArray(LS_FAV_STORES_KEY)
  );

  const [favDishIds, setFavDishIds] = useState(() =>
    readLSArray(LS_FAV_DISHES_KEY)
  );

  // ✅ SINGLE SOURCE OF TRUTH (FIXED)
  const loadAddress = async () => {
    try {
      const current = await getPrimaryAddress();

      if (!current) {
        setAddress(null);
        return;
      }

      setAddress({
        id: current.address_id,
        label: `${current.house_no || ""} ${current.street || ""}, ${current.city || ""}`.trim(),
        raw: current,
      });
    } catch (err) {
      console.error("Failed to load address:", err.message);
    }
  };

  useEffect(() => {
  getWalletBalance()
    .then((data) => setWalletBalance(data))
    .catch(() => {}); // fail silently on dashboard
}, []);

  useEffect(() => {
    loadAddress();
  }, []);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/restaurants");
        const data = await res.json();

        setRestaurants(Array.isArray(data) ? data : data?.data || []);
      } catch (err) {
        console.error("Failed to fetch restaurants:", err.message);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

const toggleStoreFavorite = (restaurantId) => {
  const key = toKey(restaurantId);

  setFavStoreIds((prev) => {
    const normalized = prev.map(toKey);

    const next = normalized.includes(key)
      ? normalized.filter((id) => id !== key)
      : [...normalized, key];

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
    let results = restaurants;

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
      results = results.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.address_line?.toLowerCase().includes(q)
      );
    }

    return results;
  }, [query, filters, restaurants]);

  if (loading) {
    return <p className="p-6">Loading restaurants...</p>;
  }

  return (
    <section className="p-6 space-y-8">

      {/* TOP BAR (UNCHANGED UI) */}
      <TopBar
        query={query}
        onQueryChange={setQuery}
        onOpenFilters={() => setFiltersOpen(true)}
        onOpenCart={() => setCartOpen(true)}
        showAddressButton={true}
        addressLabel={address?.label?.trim() || "Set address"}
        onOpenAddress={() => setIsAddressListOpen(true)}
        walletBalance={walletBalance}
      />


      {/* FILTER MODAL */}
      <SearchFiltersModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApplyFilters={setFilters}
        initialFilters={filters}
      />

      {/* ADDRESS MODAL (UNCHANGED) */}
      {/* <AddressModal open={false} onClose={() => {}} /> */}

      {/* SAVED ADDRESS MODAL */}
      <SavedAddressModal
        open={isAddressListOpen}
        onClose={() => setIsAddressListOpen(false)}
        onAddressChange={(addr) => {
          setAddress({
            id: addr.address_id,
            label: addr.formatted,
            raw: addr,
          });

          // 🔥 ensure DB sync (single refresh source only)
          loadAddress();
        }}
      />

      <CategoryCarousel />

      {/* STORES SECTION (UNCHANGED UI) */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Featured Stores</h2>

        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredStores.slice(0, 6).map((r) => {
            const isFav = favStoreIds.map(toKey).includes(toKey(r.restaurant_id));

            return (
              <li
                key={r.restaurant_id}
                onClick={() => navigate(`/store/${r.restaurant_id}`)}
                className="relative bg-white rounded-2xl border border-gray-200 p-4 cursor-pointer hover:shadow-md transition"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStoreFavorite(r.restaurant_id);
                  }}
                  className="absolute top-3 right-3 z-10 h-10 w-10 rounded-full bg-white/95 border border-gray-200 shadow-sm hover:bg-gray-50 flex items-center justify-center"
                >
                  {isFav ? (
                    <IoHeart className="text-red-500 text-xl" />
                  ) : (
                    <IoHeartOutline className="text-gray-400 text-xl" />
                  )}
                </button>

                <div className="flex gap-4 pr-10">
                  <img
                    src={r.profile_image || "https://via.placeholder.com/100"}
                    alt={r.name}
                    className="w-24 h-24 object-contain rounded-xl bg-gray-50 border border-gray-100 p-2 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {r.name}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {r.address_line || "No address available"}
                    </p>

                    <div className="mt-3 flex items-center gap-4">
                      {renderStarRating(r.rating || 0)}
                      <span className="text-xs text-gray-500">
                        ({r.review_count || 0} reviews)
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      {r.delivery_time || "20–30 min delivery"}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Order Again</h2>
         
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </section>
  );
}

export default CustomerDashboard;