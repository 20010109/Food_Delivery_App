import { useState, useEffect } from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
import AddToCartModal from "./components/AddToCartModal.jsx";

import { storeData } from "./dummyData/storeData.js";
import { menuData } from "./dummyData/menuData.js";
import "./styles/tailwind.css";

import {
  subscribeCart,
  getItemsForStore,
  addItemToCart,
  updateQty,
  calcSubtotalForStore,
  setOrderType as setOrderTypeInStore,
  getOrderType,
} from "../utils/cartStore.js";

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
function writeLSArray(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr));
}

export default function StorePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const storeId = Number(id);

  const store = useMemo(
    () => storeData.find((s) => s.restaurant_id === storeId),
    [storeId]
  );
  const menu = useMemo(
    () => menuData.filter((m) => m.restaurant_id === storeId),
    [storeId]
  );

  const [orderType, setOrderType] = useState(() => getOrderType(storeId));
  const [cartItems, setCartItems] = useState(() => getItemsForStore(storeId));

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [isFavStore, setIsFavStore] = useState(false);
  const [, forceRerender] = useState(0); // for dish fav icon refresh

  useEffect(() => {
    const unsub = subscribeCart(() => {
      setCartItems(getItemsForStore(storeId));
      setOrderType(getOrderType(storeId));
    });

    const favStores = readLSArray(LS_FAV_STORES_KEY);
    setIsFavStore(favStores.includes(storeId));

    return unsub;
  }, [storeId]);

  if (!store) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Store not found
      </div>
    );
  }

  const subtotal = calcSubtotalForStore(storeId);

  const toggleStoreFav = () => {
    const favs = readLSArray(LS_FAV_STORES_KEY);
    if (favs.includes(storeId)) {
      const updated = favs.filter((x) => x !== storeId);
      writeLSArray(LS_FAV_STORES_KEY, updated);
      setIsFavStore(false);
    } else {
      const updated = [...favs, storeId];
      writeLSArray(LS_FAV_STORES_KEY, updated);
      setIsFavStore(true);
    }
  };

  const isDishFav = (itemId) =>
    readLSArray(LS_FAV_DISHES_KEY).includes(String(itemId));

  const toggleDishFav = (itemId) => {
    const favs = readLSArray(LS_FAV_DISHES_KEY);
    const key = String(itemId);
    const updated = favs.includes(key)
      ? favs.filter((x) => x !== key)
      : [...favs, key];
    writeLSArray(LS_FAV_DISHES_KEY, updated);
    forceRerender((n) => n + 1);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full">
          {/* HEADER */}
          <div className="bg-white shadow">
            <img
              src={store.banner_url || store.image_url}
              alt={`${store.name} banner`}
              className="w-full h-64 object-cover"
            />

            <div className="p-6">
              <div className="text-sm text-gray-500 mb-2">
                <button
                  className="hover:underline"
                  onClick={() => navigate("/explore")}
                >
                  Explore
                </button>{" "}
                &gt; <span className="text-gray-700">{store.name}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{store.name}</h1>
                  <p className="text-gray-500 mt-1">📞 {store.contact_info}</p>
                </div>

                <button
                  onClick={toggleStoreFav}
                  className={`px-4 py-2 rounded-lg border transition ${
                    isFavStore
                      ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {isFavStore ? "Favourited ✓" : "Add to favourites"}
                </button>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* MENU */}
              <div className="lg:col-span-8">
                <h2 className="text-xl font-semibold mb-4">Menu</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {menu.map((item) => (
                    <div
                      key={item.item_id}
                      className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition overflow-hidden"
                    >
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-40 object-cover"
                      />

                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-semibold">{item.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {item.description}
                            </p>
                          </div>

                          <button
                            onClick={() => toggleDishFav(item.item_id)}
                            className="text-sm px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50"
                            title="Favourite dish"
                          >
                            {isDishFav(item.item_id) ? "♥" : "♡"}
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className="font-bold text-green-600">
                            ₱{item.price}
                          </span>

                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setModalOpen(true);
                            }}
                            className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 transition"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CART */}
              <div className="lg:col-span-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sticky top-6">
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => {
                        setOrderType("delivery");
                        setOrderTypeInStore(storeId, "delivery");
                      }}
                      className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                        orderType === "delivery"
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Delivery
                    </button>

                    <button
                      onClick={() => {
                        setOrderType("pickup");
                        setOrderTypeInStore(storeId, "pickup");
                      }}
                      className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                        orderType === "pickup"
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Pick-up
                    </button>
                  </div>

                  <h3 className="font-semibold mb-3">Your items</h3>

                  {cartItems.length === 0 ? (
                    <div className="h-56 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                      Cart is empty
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-56 overflow-auto pr-1">
                      {cartItems.map((ci) => (
                        <div
                          key={ci.itemId}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="font-semibold truncate">{ci.name}</div>
                            <div className="text-xs text-gray-500">
                              ₱{ci.price} • x{ci.qty}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQty(storeId, ci.itemId, ci.qty - 1)}
                              className="h-8 w-8 rounded-lg border border-gray-200 hover:bg-gray-50"
                            >
                              −
                            </button>
                            <button
                              onClick={() => updateQty(storeId, ci.itemId, ci.qty + 1)}
                              className="h-8 w-8 rounded-lg border border-gray-200 hover:bg-gray-50"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-semibold">₱{subtotal}</span>
                  </div>

                  <button
                    disabled={cartItems.length === 0}
                    className={`mt-3 w-full py-3 rounded-lg font-semibold transition ${
                      cartItems.length === 0
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL */}
        <AddToCartModal
          open={modalOpen}
          item={selectedItem}
          onClose={() => setModalOpen(false)}
          onConfirm={({ qty, notes, unavailableAction }) => {
            addItemToCart({
              storeId,
              itemId: selectedItem.item_id,
              name: selectedItem.name,
              price: selectedItem.price,
              image_url: selectedItem.image_url,
              qty,
              notes,
              unavailableAction,
            });
            setModalOpen(false);
          }}
        />
      </main>
    </div>
  );
}