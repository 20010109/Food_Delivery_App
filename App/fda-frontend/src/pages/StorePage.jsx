import { useParams } from "react-router-dom";
import { storeData } from "./dummyData/storeData.js";
import { menuData } from "./dummyData/menuData.js";
import "./styles/tailwind.css"

export default function StorePage() {
  const { id } = useParams();

  const store = storeData.find(s => s.restaurant_id === Number(id));
  const menu = menuData.filter(m => m.restaurant_id === Number(id));

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
          src={store.image_url}
          alt={store.name}
          className="w-full h-64 object-cover"
        />

        <div className="p-4">
          <h1 className="text-3xl font-bold">{store.name}</h1>
          <p className="text-gray-500 mt-1">
            📞 {store.contact_info}
          </p>
        </div>
      </div>

      {/* 🍽️ MENU SECTION */}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Menu</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {menu.map(item => (
            <div
              key={item.item_id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
            >
              {/* IMAGE */}
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-40 object-cover"
              />

              {/* CONTENT */}
              <div className="p-3">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-green-600">
                    ₱{item.price}
                  </span>

                  <button
                    className="bg-gray-400 text-white px-3 py-1.5 rounded-lg text-sm cursor-not-allowed"
                    disabled
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🛒 FLOATING CART BUTTON (optional but recommended) */}
      <div className="fixed bottom-5 right-5">
        <button className="bg-green-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-green-700 transition">
          🛒 View Cart
        </button>
      </div>
    </div>
  );
}