import React, { useEffect, useMemo, useState } from "react";
import { IoHeart, IoHeartOutline } from "react-icons/io5";
import Navbar from "./components/Navbar.jsx";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000/api";

const LS_FAV_STORES_KEY = "favStores";
const LS_FAV_DISHES_KEY = "favDishes";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/300x200?text=No+Image";

function toKey(value) {
  return String(value ?? "");
}

function readLSArray(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(toKey) : [];
  } catch {
    return [];
  }
}

function writeLSArray(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr.map(toKey)));
}

function getRestaurantId(store) {
  return store?.restaurant_id ?? store?.id;
}

function getDishId(item) {
  return item?.item_id ?? item?.id;
}

function Favourites() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("restaurants");
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [favStoreIds, setFavStoreIds] = useState(() =>
    readLSArray(LS_FAV_STORES_KEY)
  );

  const [favDishIds, setFavDishIds] = useState(() =>
    readLSArray(LS_FAV_DISHES_KEY)
  );

  useEffect(() => {
    const fetchFavouriteData = async () => {
      try {
        setLoading(true);

        const restaurantRes = await fetch(`${API_BASE}/restaurants`);

        if (!restaurantRes.ok) {
          throw new Error("Failed to fetch restaurants");
        }

        const restaurantData = await restaurantRes.json();
        const restaurantList = Array.isArray(restaurantData)
          ? restaurantData
          : restaurantData?.data || [];

        setRestaurants(restaurantList);

        const menuResults = await Promise.all(
          restaurantList.map(async (restaurant) => {
            const restaurantId = getRestaurantId(restaurant);

            if (!restaurantId) return [];

            try {
              const menuRes = await fetch(
                `${API_BASE}/menu/public/${restaurantId}`
              );

              if (!menuRes.ok) return [];

              const menuData = await menuRes.json();
              const menuList = Array.isArray(menuData)
                ? menuData
                : menuData?.data || [];

              return menuList.map((item) => ({
                ...item,
                restaurant_id: item.restaurant_id ?? restaurantId,
                restaurant,
              }));
            } catch {
              return [];
            }
          })
        );

        setMenuItems(menuResults.flat());
      } catch (err) {
        console.error("Failed to load favourites:", err.message);
        setRestaurants([]);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavouriteData();
  }, []);

  const favStoreSet = useMemo(
    () => new Set(favStoreIds.map(toKey)),
    [favStoreIds]
  );

  const favDishSet = useMemo(
    () => new Set(favDishIds.map(toKey)),
    [favDishIds]
  );

  const toggleStoreFavorite = (restaurantId) => {
    const key = toKey(restaurantId);

    setFavStoreIds((prev) => {
      const normalized = prev.map(toKey);

      const next = normalized.includes(key)
        ? normalized.filter((id) => id !== key)
        : [...normalized, key];

      writeLSArray(LS_FAV_STORES_KEY, next);
      return next;
    });
  };

  const toggleDishFavorite = (itemId) => {
    const key = toKey(itemId);

    setFavDishIds((prev) => {
      const normalized = prev.map(toKey);

      const next = normalized.includes(key)
        ? normalized.filter((id) => id !== key)
        : [...normalized, key];

      writeLSArray(LS_FAV_DISHES_KEY, next);
      return next;
    });
  };

  const favouriteRestaurants = useMemo(() => {
    return restaurants.filter((store) =>
      favStoreSet.has(toKey(getRestaurantId(store)))
    );
  }, [restaurants, favStoreSet]);

  const favouriteDishes = useMemo(() => {
    return menuItems.filter((item) => favDishSet.has(toKey(getDishId(item))));
  }, [menuItems, favDishSet]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Navbar />

        <main className="flex-1 flex items-center justify-center text-gray-500">
          Loading favourites...
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Navbar />

      <main className="flex-1 p-6 overflow-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Favourites</h1>
            <p className="text-gray-500 mt-1">
              Keep track of your favourite restaurants and dishes.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTab("restaurants")}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition ${
                tab === "restaurants"
                  ? "bg-red-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Restaurants ({favouriteRestaurants.length})
            </button>

            <button
              type="button"
              onClick={() => setTab("dishes")}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition ${
                tab === "dishes"
                  ? "bg-red-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Dishes ({favouriteDishes.length})
            </button>
          </div>

          {tab === "restaurants" && favouriteRestaurants.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {favouriteRestaurants.map((store) => {
                const restaurantId = getRestaurantId(store);
                const isFav = favStoreSet.has(toKey(restaurantId));

                return (
                  <div
                    key={restaurantId}
                    onClick={() => navigate(`/store/${restaurantId}`)}
                    className="relative bg-white rounded-2xl border border-gray-200 p-4 cursor-pointer hover:shadow-md transition"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStoreFavorite(restaurantId);
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
                        src={
                          store.profile_image ||
                          store.image_url ||
                          PLACEHOLDER_IMAGE
                        }
                        alt={store.name}
                        className="w-24 h-24 object-contain rounded-xl bg-gray-50 border border-gray-100 p-2 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-gray-900 leading-tight truncate">
                          {store.name}
                        </h2>

                        <p className="text-sm text-gray-500 mt-1 truncate">
                          {store.cuisine || "Restaurant"} •{" "}
                          {store.price_range || "₱₱"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
                          <span>⭐ {store.rating ?? 0}</span>
                          <span>
                            ({store.reviews ?? store.review_count ?? 0})
                          </span>
                          <span>{store.delivery_time || "20–30 min"}</span>
                        </div>

                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
                          <span>{store.delivery_fee || "Delivery available"}</span>
                          <span>{store.distance || ""}</span>
                        </div>

                        {store.promo_tag && (
                          <div className="mt-3">
                            <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                              {store.promo_tag}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "dishes" && favouriteDishes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {favouriteDishes.map((item) => {
                const itemId = getDishId(item);
                const restaurantId = item.restaurant_id;
                const restaurant = item.restaurant || {};
                const isFav = favDishSet.has(toKey(itemId));

                return (
                  <div
                    key={itemId}
                    onClick={() => navigate(`/store/${restaurantId}`)}
                    className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDishFavorite(itemId);
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
                      src={
                        item.item_image ||
                        item.image_url ||
                        PLACEHOLDER_IMAGE
                      }
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="text-lg font-semibold text-gray-900 leading-tight truncate">
                            {item.name}
                          </h2>

                          <p className="text-sm text-gray-500 mt-1 truncate">
                            {restaurant.name || "Restaurant"}
                          </p>
                        </div>

                        {item.badge && (
                          <span className="shrink-0 inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                        {item.description || "No description available"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
                        <span>⭐ {item.rating ?? 0}</span>
                        <span>({item.reviews ?? 0})</span>
                        <span>{item.category || "Food"}</span>
                      </div>

                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
                        <span>₱{item.price}</span>
                        <span>{item.prep_time || "10–15 min"}</span>
                        <span>{restaurant.delivery_fee || ""}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "restaurants" && favouriteRestaurants.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-500">
              No favourite restaurants yet.
            </div>
          )}

          {tab === "dishes" && favouriteDishes.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-500">
              No favourite dishes yet.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Favourites;