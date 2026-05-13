import React, { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase.js";
import { LuShoppingBag, LuBanknote, LuUtensilsCrossed, LuClock } from "react-icons/lu";

function StoreStats({ restaurantId }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!restaurantId) return;

    const fetchStats = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        const res = await fetch(
          `http://localhost:3000/api/orders/storeowner/${restaurantId}/stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, [restaurantId]);

  const items = [
    {
      label: "Orders Today",
      value: stats ? String(stats.ordersToday) : "—",
      icon: LuShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Revenue",
      value: stats ? `₱${Number(stats.totalRevenue).toLocaleString()}` : "—",
      icon: LuBanknote,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Menu Items",
      value: stats ? String(stats.totalMenuItems) : "—",
      icon: LuUtensilsCrossed,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Active Orders",
      value: stats ? String(stats.activeOrders) : "—",
      icon: LuClock,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
          <div className={`${bg} ${color} rounded-xl p-2.5 shrink-0`}>
            <Icon size={18} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StoreStats;
