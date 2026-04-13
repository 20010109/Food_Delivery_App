import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { storeData } from "./dummyData/storeData.js";
import { menuData } from "./dummyData/menuData.js";
import "./styles/tailwind.css";

export default function StorePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const store = storeData.find((s) => s.restaurant_id === Number(id));
  const menu = menuData.filter((m) => m.restaurant_id === Number(id));

  // Toggle state for delivery vs pickup
  const [orderType, setOrderType] = useState("delivery"); // "delivery" | "pickup"

  if (!store) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Store not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🏪 STORE HEADER */}
      <div className="bg-white shadow">
        <img
          src={store.banner_url || store.image_url}
          alt={`${store.name} banner`}
          className="w-full h-64 object-cover"
        />

        <div className="p-6">
          {/* breadcrumb */}
          <div className="text-sm text-gray-500 mb-2">
            <button className="hover:underline" onClick={() => navigate("/explore")}>
              Explore
            </button>{" "}
            &gt; <span className="text-gray-700">{store.name}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{store.name}</h1>
              <p className="text-gray-500 mt-1">📞 {store.contact_info}</p>
            </div>

            <button className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
              Add to favourites
            </button>
          </div>
        </div>
      </div>

      {/* 🍽️ CONTENT AREA */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* MENU GRID */}
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
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-green-600">₱{item.price}</span>

                      {/* placeholder add button */}
                      <button className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 transition">
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CART PANEL */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sticky top-6">
              {/* Toggle buttons */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setOrderType("delivery")}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition
                    ${
                      orderType === "delivery"
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  Delivery
                </button>

                <button
                  onClick={() => setOrderType("pickup")}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition
                    ${
                      orderType === "pickup"
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  Pick-up
                </button>
              </div>

              <h3 className="font-semibold mb-3">Your items</h3>

              <div className="h-56 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                Cart is empty
              </div>

              <button className="mt-4 w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition">
                Proceed to Checkout
              </button>

              {/* Optional helper text showing chosen mode */}
              <p className="text-xs text-gray-500 mt-3">
                Mode selected: <span className="font-semibold">{orderType}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}