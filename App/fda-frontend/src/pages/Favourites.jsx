import React, { useMemo, useState } from "react";
import { IoHeart, IoHeartOutline } from "react-icons/io5";
import Navbar from "./components/Navbar.jsx";
import { useNavigate } from "react-router-dom";
import { storeData } from "./dummyData/storeData.js";
import { menuData } from "./dummyData/menuData.js";

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

function Favourites() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("restaurants");
  const [favStoreIds, setFavStoreIds] = useState(() =>
    readLSArray(LS_FAV_STORES_KEY)
  );
  const [favDishIds, setFavDishIds] = useState(() =>
    readLSArray(LS_FAV_DISHES_KEY)
  );

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

  const favouriteRestaurants = useMemo(
    () => storeData.filter((store) => favStoreIds.includes(store.restaurant_id)),
    [favStoreIds]
  );

  const favouriteDishes = useMemo(() => {
    return menuData
      .filter((item) => favDishIds.includes(item.item_id))
      .map((item) => {
        const restaurant = storeData.find(
          (store) => store.restaurant_id === item.restaurant_id
        );

        return {
          ...item,
          restaurant,
        };
      })
      .filter((item) => item.restaurant);
  }, [favDishIds]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Navbar />

      <main className="flex-1 p-6 overflow-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Favourites</h1>
            <p className="text-gray-500 mt-1">
              Keep track of your favorite restaurants and dishes.
            </p>
          </div>

          <div className="flex gap-3">
            <button
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

          {tab === "restaurants" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {favouriteRestaurants.map((store) => {
                const isFav = favStoreIds.includes(store.restaurant_id);

                return (
                  <div
                    key={store.restaurant_id}
                    onClick={() => navigate(`/store/${store.restaurant_id}`)}
                    className="relative bg-white rounded-2xl border border-gray-200 p-4 cursor-pointer hover:shadow-md transition"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStoreFavorite(store.restaurant_id);
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
                        src={store.image_url}
                        alt={store.name}
                        className="w-24 h-24 object-contain rounded-xl bg-gray-50 border border-gray-100 p-2 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-gray-900 leading-tight">
                          {store.name}
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                          {store.cuisine} • {store.price_range}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
                          <span>⭐ {store.rating}</span>
                          <span>({store.reviews})</span>
                          <span>{store.delivery_time}</span>
                        </div>

                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
                          <span>{store.delivery_fee}</span>
                          <span>{store.distance}</span>
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

          {tab === "dishes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {favouriteDishes.map((item) => {
                const isFav = favDishIds.includes(item.item_id);

                return (
                  <div
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
                          <h2 className="text-lg font-semibold text-gray-900 leading-tight truncate">
                            {item.name}
                          </h2>
                          <p className="text-sm text-gray-500 mt-1 truncate">
                            {item.restaurant.name}
                          </p>
                        </div>

                        {item.badge && (
                          <span className="shrink-0 inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                        {item.description}
                      </p>

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