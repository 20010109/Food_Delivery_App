import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { storeData } from "../dummyData/storeData.js";
import "../styles/tailwind.css";

function CustomerDashboard() {
  const [text, setText] = useState("");
  const navigate = useNavigate();

  return (
    <section className="p-5">
      <div>
        <div className="mt-5 mb-5 flex items-center justify-between">
          <h1 className="text-2xl">Featured Stores</h1>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => {
              // optional: navigate to /stores
            }}
          >
            See All
          </button>
        </div>

        <ul className="grid grid-cols-3 gap-4">
          {storeData.slice(0, 6).map((restaurant) => (
            <li
              key={restaurant.restaurant_id}
              onClick={() =>
                navigate(`/store/${restaurant.restaurant_id}`)
              }
              className="bg-white rounded shadow p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
            >
              <img
                src={restaurant.image_url}
                alt={restaurant.name}
                className="w-24 h-24 object-cover rounded mb-2"
              />
              <span className="font-semibold">
                {restaurant.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default CustomerDashboard;