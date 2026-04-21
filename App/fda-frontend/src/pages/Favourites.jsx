import React, { useMemo } from "react";
import Navbar from "./components/Navbar.jsx";
import { useNavigate } from "react-router-dom";
import { storeData } from "./dummyData/storeData.js";
import { menuData } from "./dummyData/menuData.js";

const LS_FAV_STORES_KEY = "favStores";

// Optional (future): you can also store dishes later
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
  const [tab, setTab] = React.useState("restaurants");

  // Demo fallback IDs (only used if localStorage empty)
  const fallbackStoreIds = [1, 2, 7, 8, 12];
  const fallbackDishIds = ["1", "4", "7", "15", "17"];

  const favStoreIds = useMemo(() => {
    const ls = readLSArray(LS_FAV_STORES_KEY);
    return ls.length ? ls : fallbackStoreIds;
  }, []);

  const favDishIds = useMemo(() => {
    const ls = readLSArray(LS_FAV_DISHES_KEY);
    return ls.length ? ls : fallbackDishIds;
  }, []);

  // filter favourite restaurants
  const favourites = useMemo(
    () => storeData.filter((store) => favStoreIds.includes(store.restaurant_id)),
    [favStoreIds]
  );

  // filter favourite dishes
  const favouriteDishes = useMemo(
    () => menuData.filter((item) => favDishIds.includes(item.item_id)),
    [favDishIds]
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Navbar />

      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">Favourites</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab("restaurants")}
            className={`px-4 py-2 rounded-full ${
              tab === "restaurants" ? "bg-red-500 text-white" : "bg-gray-200"
            }`}
          >
            Restaurants ({favourites.length})
          </button>

          <button
            onClick={() => setTab("dishes")}
            className={`px-4 py-2 rounded-full ${
              tab === "dishes" ? "bg-red-500 text-white" : "bg-gray-200"
            }`}
          >
            Dishes ({favouriteDishes.length})
          </button>
        </div>

        {/* RESTAURANTS */}
        {tab === "restaurants" && (
          <div className="grid grid-cols-3 gap-6">
            {favourites.map((store) => (
              <div
                key={store.restaurant_id}
                onClick={() => navigate(`/store/${store.restaurant_id}`)}
                className="bg-white p-4 rounded-xl shadow hover:shadow-lg hover:scale-105 transition cursor-pointer"
              >
                <img
                  src={store.image_url}
                  alt={store.name}
                  className="h-20 mx-auto object-contain"
                />

                <h2 className="text-lg font-bold mt-3 text-center">
                  {store.name}
                </h2>

                <p className="text-sm text-gray-500 text-center mt-1">
                  Restaurant
                </p>
              </div>
            ))}
          </div>
        )}

        {/* DISHES */}
        {tab === "dishes" && (
          <div className="grid grid-cols-3 gap-6">
            {favouriteDishes.map((item) => (
              <div
                key={item.item_id}
                onClick={() => navigate(`/store/${item.restaurant_id}`)}
                className="bg-white p-4 rounded-xl shadow hover:shadow-lg hover:scale-105 transition cursor-pointer"
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="h-20 mx-auto object-cover rounded"
                />

                <h2 className="text-lg font-bold mt-3 text-center">
                  {item.name}
                </h2>

                <p className="text-sm text-gray-500 text-center">₱{item.price}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Favourites;