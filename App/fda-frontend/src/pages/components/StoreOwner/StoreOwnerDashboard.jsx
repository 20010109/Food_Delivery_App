import React, { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase.js";

import StoreOwnerNavbar from "./StoreOwnerNavbar.jsx";
import StoreOwnerEditStoreModal from "./StoreOwnerEditStoreModal.jsx";
import StoreOwnerCreateStoreModal from "./StoreOwnerCreateStoreModal.jsx";
import MenuSection from "./MenuSection.jsx";
import StoreStats from "./StoreStats.jsx";
import StoreOwnerOrdersSection from "./StoreOwnerOrdersSection.jsx";
import StoreOwnerAnalytics from "./StoreOwnerAnalytics.jsx";
import OverviewSummary from "./OverviewSummary.jsx";
import { LuPencil, LuPlus, LuPhone, LuMapPin } from "react-icons/lu";

function StoreOwnerDashboard({ activeTab }) {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) return;

      const res = await fetch("http://localhost:3000/api/restaurants/storeowner", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const normalized = Array.isArray(data) ? data[0] : data?.restaurant || data || null;
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
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(updatedData),
        }
      );
      const data = await res.json();
      setRestaurant(data || updatedData);
      setEditOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchRestaurant(); }, []);

  if (loading) {
    return (
      <>
        <StoreOwnerNavbar activeTab={activeTab} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm animate-pulse">Loading your store...</p>
        </div>
      </>
    );
  }

  if (!restaurant) {
    return (
      <>
        <StoreOwnerNavbar activeTab={activeTab} />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center space-y-4 max-w-sm w-full">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
              <LuPlus size={28} className="text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">No restaurant yet</h2>
            <p className="text-sm text-gray-400">Create your restaurant to start managing orders and menu.</p>
            <button
              onClick={() => setCreateOpen(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition"
            >
              Create Restaurant
            </button>
          </div>
        </main>
        <StoreOwnerCreateStoreModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSuccess={fetchRestaurant}
        />
      </>
    );
  }

  return (
    <>
      <StoreOwnerNavbar
        activeTab={activeTab}
        restaurantName={restaurant.name}
        onRefresh={fetchRestaurant}
      />

      <main className="flex-1 overflow-auto p-6 space-y-6">

        {/* ===== OVERVIEW ===== */}
        {activeTab === "overview" && (
          <div className="space-y-6">

            {/* Store Hero Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div
                className="h-44 bg-cover bg-center relative"
                style={{
                  backgroundImage: `url(${restaurant.background_image || "https://placehold.co/1200x400/f3f4f6/9ca3af?text=Cover+Image"})`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button
                  onClick={() => setEditOpen(true)}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition"
                >
                  <LuPencil size={12} /> Edit Store
                </button>
                <div className="absolute bottom-0 left-0 p-5 flex items-end gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow bg-gray-200 shrink-0">
                    <img src={restaurant.profile_image} alt="logo" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-white">
                    <h2 className="text-xl font-bold">{restaurant.name}</h2>
                    <span className={`inline-block mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      restaurant.status === "open" ? "bg-green-500" : "bg-gray-500"
                    }`}>
                      {restaurant.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 flex flex-wrap gap-4 text-sm text-gray-500 border-t border-gray-100">
                {restaurant.contact_info && (
                  <span className="flex items-center gap-1.5">
                    <LuPhone size={13} className="text-gray-400" /> {restaurant.contact_info}
                  </span>
                )}
                {restaurant.addresses && (
                  <span className="flex items-center gap-1.5">
                    <LuMapPin size={13} className="text-gray-400" />
                    {[restaurant.addresses.barangay, restaurant.addresses.city].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <StoreStats restaurantId={restaurant.restaurant_id} />

            {/* Weekly Summary */}
            <OverviewSummary restaurantId={restaurant.restaurant_id} />

          </div>
        )}

        {/* ===== ANALYTICS ===== */}
        {activeTab === "analytics" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <StoreOwnerAnalytics restaurantId={restaurant.restaurant_id} />
          </div>
        )}

        {/* ===== MENU ===== */}
        {activeTab === "menu" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <MenuSection restaurantId={restaurant.restaurant_id} />
          </div>
        )}

        {/* ===== ORDERS ===== */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <StoreOwnerOrdersSection restaurantId={restaurant.restaurant_id} />
          </div>
        )}

      </main>

      <StoreOwnerEditStoreModal
        open={editOpen}
        restaurant={restaurant}
        onClose={() => setEditOpen(false)}
        onSave={handleUpdateRestaurant}
      />
    </>
  );
}

export default StoreOwnerDashboard;
