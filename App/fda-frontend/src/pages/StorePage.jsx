import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
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

  // ✅ CART
  const { cart, addToCart, updateQty, removeItem } = useCart();

  const storeCart =
    cart.find((s) => s.storeId === storeId)?.items || [];

  const subtotal = storeCart.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );

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
      writeLSArray(LS_FAV_STORES_KEY, favs.filter((x) => x !== storeId));
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
        <div className="bg-white shadow">
          <img
            src={store.banner_url || store.image_url}
            className="w-full h-64 object-cover"
            alt={store.name}
          />

          <div className="p-6 flex justify-between">
            <div>
              <h1 className="text-3xl font-bold">{store.name}</h1>
              <p className="text-gray-500">
                📞 {store.contact_info}
              </p>
            </div>

            <button
              onClick={toggleStoreFav}
              className={`px-4 py-2 rounded-lg border ${
                isFavStore
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white"
              }`}
            >
              {isFavStore ? "Favourited ✓" : "Add to favourites"}
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 grid grid-cols-12 gap-6">

          {/* MENU */}
          <div className="col-span-8 grid grid-cols-2 gap-4">
            {menu.map((item) => (
              <div
                key={item.item_id}
                className="bg-white rounded-xl border p-3"
              >
                <img
                  src={item.image_url}
                  className="h-40 w-full object-cover rounded"
                  alt={item.name}
                />

                <div className="mt-2 flex justify-between">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      {item.description}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleDishFav(item.item_id)}
                  >
                    {isDishFav(item.item_id) ? "♥" : "♡"}
                  </button>
                </div>

                <div className="flex justify-between mt-3">
                  <span className="font-bold text-green-600">
                    ₱{item.price}
                  </span>

                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setModalOpen(true);
                    }}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* CART */}
          <div className="col-span-4 bg-white p-4 rounded-xl border sticky top-6">
            <h2 className="font-bold mb-3">Your Items</h2>

            {storeCart.length === 0 ? (
              <p className="text-gray-400">Cart is empty</p>
            ) : (
              storeCart.map((ci) => (
                <div key={ci.id} className="flex justify-between mb-2">
                  <div>
                    <p className="font-semibold">{ci.name}</p>
                    <p className="text-sm text-gray-500">
                      ₱{ci.price} x {ci.qty}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        updateQty(storeId, ci.id, ci.qty - 1)
                      }
                    >
                      -
                    </button>

                    <button
                      onClick={() =>
                        updateQty(storeId, ci.id, ci.qty + 1)
                      }
                    >
                      +
                    </button>

                    <button
                      onClick={() =>
                        removeItem(storeId, ci.id)
                      }
                    >
                      x
                    </button>
                  </div>
                </div>
              ))
            )}

            <div className="mt-4 font-bold">
              Subtotal: ₱{subtotal}
            </div>

            <button className="w-full bg-red-600 text-white py-3 rounded-lg mt-3">
              Proceed to Checkout
            </button>
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