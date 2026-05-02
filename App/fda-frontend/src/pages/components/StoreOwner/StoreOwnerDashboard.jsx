import React, { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase.js";

import StoreOwnerEditStoreModal from "./StoreOwnerEditStoreModal.jsx";
import StoreOwnerCreateStoreModal from "./StoreOwnerCreateStoreModal.jsx";
import MenuSection from "./MenuSection.jsx";
import StoreStats from "./StoreStats.jsx";
import StoreOwnerOrdersSection from "./StoreOwnerOrdersSection.jsx";

function StoreOwnerDashboard() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // ================= FETCH RESTAURANT =================
  const fetchRestaurant = async () => {
    try {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) return;

      const res = await fetch(
        "http://localhost:3000/api/restaurants/storeowner",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      const normalized =
        Array.isArray(data) ? data[0] : data?.restaurant || data || null;

      setRestaurant(normalized);
    } catch (err) {
      console.error(err);
      setRestaurant(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRestaurant = async (updatedData) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
  
      if (!token || !restaurant) return;
  
      const res = await fetch(
        `http://localhost:3000/api/restaurants/storeowner/${restaurant.restaurant_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );
  
      const data = await res.json();
  
      // refresh UI
      setRestaurant(data || updatedData);
      setEditOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRestaurant();
  }, []);

  // ================= DELETE =================
  const handleDelete = async () => {
    if (!restaurant) return;

    const ok = confirm("Delete your restaurant?");
    if (!ok) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    await fetch(
      `http://localhost:3000/api/restaurants/storeowner/${restaurant.restaurant_id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setRestaurant(null);
  };

  return (
    <div className="p-6 space-y-10">

      {/* ================= HERO ================= */}
      {restaurant && (
        <div className="relative bg-white border rounded-2xl overflow-hidden">

          {/* COVER */}
          <div
            className="h-72 bg-cover bg-center relative"
            style={{
              backgroundImage: `url(${
                restaurant.background_image ||
                "https://via.placeholder.com/1200x400"
              })`,
            }}
          >

            {/* EDIT BUTTON */}
            <button
              onClick={() => setEditOpen(true)}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white px-4 py-2 rounded-xl text-sm shadow"
            >
              Edit Store
            </button>

            {/* PROFILE INFO */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/60 to-transparent flex items-end gap-4">

              <div className="h-20 w-20 rounded-2xl overflow-hidden border-4 border-white bg-gray-200">
                <img
                  src={restaurant.profile_image}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-white">
                <h1 className="text-2xl font-bold">
                  {restaurant.name}
                </h1>

                <p className="text-sm text-white/80">
                  {restaurant.contact_info}
                </p>

                <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-white/20">
                  {restaurant.status}
                </span>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ================= STATS ================= */}
      {restaurant && (
        <StoreStats restaurantId={restaurant.restaurant_id} />
      )}

      {/* ================= MENU SECTION ================= */}
      {restaurant && (
        <div className="bg-white border rounded-2xl p-6">

          <MenuSection restaurantId={restaurant.restaurant_id} />

        </div>
      )}

      {/* ================= ORDERS SECTION ================= */}
      {restaurant && (
        <div className="bg-white border rounded-2xl p-6">
          <StoreOwnerOrdersSection restaurantId={restaurant.restaurant_id} />
        </div>
      )}

      {/* ================= EMPTY STATE ================= */}
      {!loading && !restaurant && (
        <div className="bg-white border rounded-2xl p-10 text-center space-y-3">

          <h2 className="text-lg font-semibold">
            No restaurant found
          </h2>

          <p className="text-gray-500">
            Create your restaurant to start managing orders and menu.
          </p>

          <button
            onClick={() => setCreateOpen(true)}
            className="bg-red-500 text-white px-4 py-2 rounded-xl"
          >
            Create Restaurant
          </button>

        </div>
      )}

      {/* ================= LOADING ================= */}
      {loading && (
        <div className="bg-white border rounded-2xl p-6 animate-pulse">
          Loading dashboard...
        </div>
      )}

      {/* ================= MODALS ================= */}
      <StoreOwnerEditStoreModal
        open={editOpen}
        restaurant={restaurant}
        onClose={() => setEditOpen(false)}
        onSave={handleUpdateRestaurant}
      />

      <StoreOwnerCreateStoreModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={fetchRestaurant}
      />

    </div>
  );
}

// ================= STAT COMPONENT =================
function Stat({ label, value }) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

export default StoreOwnerDashboard;