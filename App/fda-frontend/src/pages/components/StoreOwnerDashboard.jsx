import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase.js";
import StoreOwnerEditStoreModal from "./StoreOwnerEditStoreModal.jsx";
import StoreOwnerCreateStoreModal from "./StoreOwnerCreateStoreModal.jsx";
import StoreOwnerMenuItemModal from "./StoreOwnerMenuItemModal.jsx";
import "../styles/tailwind.css";

function StoreOwnerDashboard() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  // 🔥 Fetch owner restaurants
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
  
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
  
      if (!token) {
        throw new Error("No authenticated session");
      }
  
      const res = await fetch("http://localhost:3000/api/restaurants/storeowner", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!res.ok) {
        throw new Error("Request failed");
      }
  
      const data = await res.json();
      setRestaurants(data);
    } catch (err) {
      console.error("Failed to fetch restaurants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // ❌ Delete
  const handleDelete = async (id) => {
    const confirmDelete = confirm("Delete this restaurant?");
    if (!confirmDelete) return;

    try {
      await fetch(`/api/restaurants/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      setRestaurants((prev) =>
        prev.filter((r) => r.restaurant_id !== id)
      );
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <section className="p-6 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          My Restaurants
        </h1>

        <button
          onClick={() => setCreateOpen(true)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
        >
          + Add Restaurant
        </button>
      </div>

      {/* LOADING */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : restaurants.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
          <p className="text-gray-500">
            You don’t have any restaurants yet.
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-4 text-red-500 hover:text-red-700 text-sm"
          >
            Create your first restaurant
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {restaurants.map((r) => (
            <li
              key={r.restaurant_id}
              className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition"
            >
              {/* IMAGE */}
              <div
                className="w-full h-40 rounded-xl mb-3 bg-gray-100 bg-center bg-cover relative"
                style={{
                  backgroundImage: `url(${r.background_image || r.profile_image || "https://via.placeholder.com/400"})`,
                }}
              >
                {/* optional overlay for readability */}
                <div className="absolute inset-0 bg-black/10 rounded-xl" />
              </div>

              {/* INFO */}
              <h3 className="text-lg font-semibold text-gray-900">
                {r.name}
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                {r.description || "No description"}
              </p>

              {/* STATUS BADGE */}
              <div className="mt-3">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    r.status === "approved"
                      ? "bg-green-50 text-green-600"
                      : r.status === "pending"
                      ? "bg-yellow-50 text-yellow-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {r.status}
                </span>
              </div>

              {/* ACTIONS */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedRestaurant(r);
                    setEditOpen(true);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 rounded-lg"
                >
                  Edit
                </button>

                <button
                  onClick={() => {
                    setSelectedRestaurantId(r.restaurant_id);
                    setMenuOpen(true);
                  }}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm py-2 rounded-lg"
                >
                  Menu
                </button>

                <button
                  onClick={() => handleDelete(r.restaurant_id)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-sm py-2 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}


      {/* MODALS */}
      <StoreOwnerEditStoreModal
        open={editOpen}
        restaurant={selectedRestaurant}
        onClose={() => setEditOpen(false)}
        onSave={async (updatedData) => {
          try {
            await fetch(
              `http://localhost:3000/api/restaurants/storeowner/${selectedRestaurant.restaurant_id}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${await supabase.auth.getSession().then(s => s.data.session.access_token)}`,
                },
                body: JSON.stringify(updatedData),
              }
            );

            fetchRestaurants(); // refresh list
            setEditOpen(false);
          } catch (err) {
            console.error("Update failed:", err);
          }
        }}
      />

      <StoreOwnerCreateStoreModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={fetchRestaurants}
      />

      <StoreOwnerMenuItemModal
        open={menuOpen}
        restaurantId={selectedRestaurantId}
        onClose={() => setMenuOpen(false)}
      />
    </section>
  );
}

export default StoreOwnerDashboard;