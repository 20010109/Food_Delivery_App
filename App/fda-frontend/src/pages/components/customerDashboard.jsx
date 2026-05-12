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
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);

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

  // Fetch all menu items once (lazy — only on first filter activation)
  const menuItemsFetched = React.useRef(false);
  useEffect(() => {
    const hasFilters = Object.values(filters).some(Boolean);
    if (!hasFilters || menuItemsFetched.current) return;
    menuItemsFetched.current = true;
    setMenuLoading(true);
    fetch("http://localhost:3000/api/menu/all-public")
      .then((r) => r.json())
      .then((data) => setMenuItems(Array.isArray(data) ? data : []))
      .catch(() => setMenuItems([]))
      .finally(() => setMenuLoading(false));
  }, [filters]);

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

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const showFoods = activeFilterCount > 0;

  // Restaurant lookup map for rating/review_count
  const restaurantMap = useMemo(() => {
    const map = {};
    restaurants.forEach((r) => { map[r.restaurant_id] = r; });
    return map;
  }, [restaurants]);

  const filteredFoods = useMemo(() => {
    if (!showFoods) return [];
    const q = query.trim().toLowerCase();
    let results = menuItems.map((item) => ({
      ...item,
      restaurant_rating: restaurantMap[item.restaurant_id]?.rating || 0,
      restaurant_reviews: restaurantMap[item.restaurant_id]?.review_count || 0,
    }));

    if (q) {
      results = results.filter((i) => i.name?.toLowerCase().includes(q) || i.restaurant_name?.toLowerCase().includes(q));
    }

    if (filters.priceRange) {
      results = results.filter((i) => {
        const p = Number(i.price || 0);
        if (filters.priceRange === "₱") return p < 100;
        if (filters.priceRange === "₱₱") return p >= 100 && p <= 300;
        if (filters.priceRange === "₱₱₱") return p > 300;
        return true;
      });
    }

    if (filters.sortBy === "rating") {
      results = [...results].sort((a, b) => b.restaurant_rating - a.restaurant_rating);
    } else if (filters.sortBy === "reviews") {
      results = [...results].sort((a, b) => b.restaurant_reviews - a.restaurant_reviews);
    }

    return results;
  }, [showFoods, menuItems, filters, query, restaurantMap]);

  const removeFilter = (key) => {
    setFilters((prev) => { const next = { ...prev }; delete next[key]; return next; });
  };

  const filteredStores = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.address_line?.toLowerCase().includes(q)
    );
  }, [query, restaurants]);

  const FILTER_LABELS = { cuisine: "Cuisine", priceRange: "Price", deliveryTime: "Delivery", sortBy: "Sort" };

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
        activeFilterCount={activeFilterCount}
      />


      {/* FILTER MODAL */}
      <SearchFiltersModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApplyFilters={setFilters}
        initialFilters={filters}
      />

      {/* ACTIVE FILTER CHIPS */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 -mt-4">
          {Object.entries(filters).filter(([, v]) => v).map(([key, val]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-full"
            >
              <span className="text-red-400 font-normal">{FILTER_LABELS[key] || key}:</span> {val}
              <button
                onClick={() => removeFilter(key)}
                className="ml-0.5 text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </span>
          ))}
          <button
            onClick={() => setFilters({})}
            className="text-xs text-gray-400 hover:text-gray-600 underline px-1"
          >
            Clear all
          </button>
        </div>
      )}

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

      {/* FOOD ITEMS GRID — shown when filters are active */}
      {showFoods ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Food Results</h2>
          {menuLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse h-28" />
              ))}
            </div>
          ) : filteredFoods.length === 0 ? (
            <p className="text-gray-500 text-sm">No foods match your filters.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredFoods.map((item) => (
                <li
                  key={item.item_id}
                  onClick={() => navigate(`/store/${item.restaurant_id}`)}
                  className="bg-white rounded-2xl border border-gray-200 p-4 cursor-pointer hover:shadow-md transition flex gap-4"
                >
                  <img
                    src={item.item_image || "https://via.placeholder.com/80"}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl bg-gray-50 border border-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{item.restaurant_name}</p>
                    <p className="text-sm font-bold text-red-600 mt-2">₱{Number(item.price).toFixed(2)}</p>
                    {item.restaurant_rating > 0 && (
                      <div className="mt-1">{renderStarRating(item.restaurant_rating)}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        /* STORES SECTION — shown when no filters active */
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Featured Restaurants</h2>

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

                    {/* <div className="mt-2 text-xs text-gray-500">
                      {r.delivery_time || "20–30 min delivery"}
                    </div> */}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </section>
  );
}

export default CustomerDashboard;