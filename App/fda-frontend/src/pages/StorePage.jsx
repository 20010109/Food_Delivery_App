import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  IoHeart,
  IoHeartOutline,
} from "react-icons/io5";
import {
  LuPhone,
  LuMinus,
  LuPlus,
  LuTrash2,
} from "react-icons/lu";

import Navbar from "./components/Navbar.jsx";
import AddToCartModal from "./components/AddToCartModal.jsx";

import { storeData } from "./dummyData/storeData.js";
import { menuData } from "./dummyData/menuData.js";
import "./styles/tailwind.css";

import { useCart } from "../context/CartContext";

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

  const { cart, addToCart, updateQty, removeItem } = useCart();

  const storeCart = cart.find((s) => s.storeId === storeId)?.items || [];

  const subtotal = storeCart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [isFavStore, setIsFavStore] = useState(false);
  const [, forceRerender] = useState(0);

  useEffect(() => {
    const favStores = readLSArray(LS_FAV_STORES_KEY);
    setIsFavStore(favStores.includes(storeId));
  }, [storeId]);

  if (!store) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Store not found
      </div>
    );
  }

  const toggleStoreFav = () => {
    const favs = readLSArray(LS_FAV_STORES_KEY);

    if (favs.includes(storeId)) {
      writeLSArray(
        LS_FAV_STORES_KEY,
        favs.filter((x) => x !== storeId)
      );
      setIsFavStore(false);
    } else {
      writeLSArray(LS_FAV_STORES_KEY, [...favs, storeId]);
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
        {/* HEADER */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <img
            src={store.banner_url || store.image_url}
            className="w-full h-64 object-cover"
            alt={store.name}
          />

          <div className="p-6 flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>

              <div className="mt-2 flex items-center gap-2 text-gray-500">
                <LuPhone className="text-red-500" />
                <span>{store.contact_info}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                <span>{store.cuisine}</span>
                <span>•</span>
                <span>{store.price_range}</span>
                <span>•</span>
                <span>⭐ {store.rating}</span>
                <span>({store.reviews})</span>
                <span>•</span>
                <span>{store.delivery_time}</span>
              </div>
            </div>

            <button
              onClick={toggleStoreFav}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              {isFavStore ? (
                <>
                  <IoHeart className="text-red-500 text-lg" />
                  <span>Favourited</span>
                </>
              ) : (
                <>
                  <IoHeartOutline className="text-gray-400 text-lg" />
                  <span>Add to favourites</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 grid grid-cols-12 gap-6">
          {/* MENU */}
          <div className="col-span-8 grid grid-cols-2 gap-5">
            {menu.map((item) => (
              <div
                key={item.item_id}
                className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition"
              >
                <img
                  src={item.image_url}
                  className="h-44 w-full object-cover rounded-xl"
                  alt={item.name}
                />

                <div className="mt-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleDishFav(item.item_id)}
                    className="h-10 w-10 shrink-0 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 flex items-center justify-center transition"
                    aria-label="Toggle favourite"
                    title="Favourite"
                  >
                    {isDishFav(item.item_id) ? (
                      <IoHeart className="text-red-500 text-xl" />
                    ) : (
                      <IoHeartOutline className="text-gray-400 text-xl" />
                    )}
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="font-bold text-2xl text-green-600">
                    ₱{item.price}
                  </span>

                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setModalOpen(true);
                    }}
                    className="h-12 w-12 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center justify-center transition"
                  >
                    <LuPlus className="text-xl" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* CART */}
          <div className="col-span-4 bg-white p-5 rounded-2xl border border-gray-200 sticky top-6 h-fit shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Items</h2>

            {storeCart.length === 0 ? (
              <p className="text-gray-400">Cart is empty</p>
            ) : (
              <div className="space-y-4">
                {storeCart.map((ci) => (
                  <div
                    key={ci.id}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">{ci.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          ₱{ci.price} x {ci.qty}
                        </p>
                      </div>

                      <button
                        onClick={() => removeItem(storeId, ci.id)}
                        className="h-9 w-9 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition"
                        title="Remove item"
                      >
                        <LuTrash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-xl border border-gray-200 overflow-hidden">
                        <button
                          onClick={() => updateQty(storeId, ci.id, ci.qty - 1)}
                          className="h-10 w-10 flex items-center justify-center hover:bg-gray-50 transition"
                          title="Decrease quantity"
                        >
                          <LuMinus size={16} />
                        </button>

                        <div className="w-10 text-center font-semibold text-gray-900">
                          {ci.qty}
                        </div>

                        <button
                          onClick={() => updateQty(storeId, ci.id, ci.qty + 1)}
                          className="h-10 w-10 flex items-center justify-center hover:bg-gray-50 transition"
                          title="Increase quantity"
                        >
                          <LuPlus size={16} />
                        </button>
                      </div>

                      <div className="font-semibold text-gray-900">
                        ₱{ci.price * ci.qty}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-xl font-bold text-gray-900">
                <span>Subtotal</span>
                <span>₱{subtotal}</span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-red-600 text-white py-3 rounded-xl mt-4 font-semibold hover:bg-red-700 transition"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>

        {/* MODAL */}
        <AddToCartModal
          open={modalOpen}
          item={selectedItem}
          onClose={() => setModalOpen(false)}
          onConfirm={({ qty, notes, unavailableAction }) => {
            if (!selectedItem) return;

            addToCart({
              storeId,
              storeName: store.name,
              id: selectedItem.item_id,
              name: selectedItem.name,
              price: selectedItem.price,
              image_url: selectedItem.image_url,
              qty,
              notes,
              unavailableAction: unavailableAction || "remove",
            });

            setModalOpen(false);
            setSelectedItem(null);
          }}
        />
      </main>
    </div>
  );
}