import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  IoHeart,
  IoHeartOutline,
  IoChevronForward,
} from "react-icons/io5";
import {
  LuPhone,
  LuMinus,
  LuPlus,
  LuTrash2,
} from "react-icons/lu";

import Navbar from "./components/Navbar.jsx";
import AddToCartModal from "./components/AddToCartModal.jsx";
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

  const storeId = id;

  const [store, setStore] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `http://localhost:3000/api/restaurants/${storeId}`
        );

        if (!res.ok) throw new Error("Store fetch failed");

        const storeData = await res.json();
        setStore(storeData);

        const menuRes = await fetch(
          `http://localhost:3000/api/menu/public/${storeId}`
        );

        if (!menuRes.ok) throw new Error("Menu fetch failed");

        const menuData = await menuRes.json();
        setMenu(menuData || []);
      } catch (err) {
        console.error(err.message);
        setStore(null);
        setMenu([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storeId]);

  useEffect(() => {
    const favStores = readLSArray(LS_FAV_STORES_KEY);
    setIsFavStore(favStores.includes(storeId));
  }, [storeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading store...
      </div>
    );
  }

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

        {/* BREADCRUMB */}
        <div className="px-6 pt-4 flex items-center gap-2 text-sm text-gray-500">
          <span
            onClick={() => navigate("/explore")}
            className="cursor-pointer hover:text-red-600"
          >
            Explore
          </span>

          <IoChevronForward size={14} />

          <span>{store.name}</span>
        </div>

        {/* HEADER */}
        <div className="bg-white shadow-sm border-b border-gray-200 mt-3">
          <div className="relative">
            <img
              src={store.background_image || store.profile_image}
              className="w-full h-64 object-cover"
              alt={store.name}
            />

            {/* PROFILE IMAGE */}
            <img
              src={store.profile_image}
              alt={store.name}
              className="absolute left-6 bottom-[-35px] w-50 h-50 rounded-2xl border-4 border-white bg-white object-cover shadow-lg"
            />
          </div>

          <div className="p-6 pt-12 flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {store.name}
              </h1>

              <div className="mt-2 flex items-center gap-2 text-gray-500">
                <LuPhone className="text-red-500" />
                <span>{store.contact_info}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                <span>
                  Cuisine: {store.cuisine || "Not specified"}
                </span>

                <span>•</span>

                <span>
                  Price Range:{" "}
                  {store.price_range || "Not specified"}
                </span>

                <span>•</span>

                <span>
                  Rating: ⭐ {store.rating || "Not specified"}
                </span>

                <span>
                  Reviews: {store.reviews || "Not specified"}
                </span>

                <span>•</span>

                <span>
                  Delivery Time:{" "}
                  {store.delivery_time || "20-30 mins"}
                </span>
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
                  src={item.item_image}
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
                    onClick={() =>
                      toggleDishFav(item.item_id)
                    }
                    className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center"
                  >
                    {isDishFav(item.item_id) ? (
                      <IoHeart className="text-red-500" />
                    ) : (
                      <IoHeartOutline className="text-gray-400" />
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
                    className="h-12 w-12 rounded-xl bg-red-600 text-white flex items-center justify-center"
                  >
                    <LuPlus />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* CART */}
          <div className="col-span-4 bg-white p-5 rounded-2xl border border-gray-200 sticky top-6 h-fit">
            <h2 className="text-2xl font-bold mb-4">
              Your Items
            </h2>

            {storeCart.length === 0 ? (
              <p className="text-gray-400">
                Cart is empty
              </p>
            ) : (
              storeCart.map((ci) => (
                <div
                  key={ci.id}
                  className="border p-4 rounded-xl mb-3"
                >
                  <p className="font-semibold">
                    {ci.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    ₱{ci.price} x {ci.qty}
                  </p>
                </div>
              ))
            )}

            <div className="mt-6 border-t pt-4 font-bold text-xl">
              Subtotal: ₱{subtotal}
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-red-600 text-white py-3 rounded-xl mt-4"
            >
              Checkout
            </button>
          </div>
        </div>

        {/* MODAL */}
        <AddToCartModal
          open={modalOpen}
          item={selectedItem}
          onClose={() => setModalOpen(false)}
          onConfirm={({ qty }) => {
            if (!selectedItem) return;

            addToCart({
              storeId,
              storeName: store.name,
              id: selectedItem.item_id,
              name: selectedItem.name,
              price: selectedItem.price,
              item_image: selectedItem.item_image,
              qty,
            });

            setModalOpen(false);
            setSelectedItem(null);
          }}
        />
      </main>
    </div>
  );
}