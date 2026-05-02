import React, { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase.js";

function StoreStats({ restaurantId, menuItemCount }) {
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
    },
    {
      label: "Revenue",
      value: stats ? `₱${Number(stats.totalRevenue).toLocaleString()}` : "—",
    },
    {
      label: "Menu Items",
      value: menuItemCount !== undefined ? String(menuItemCount) : "—",
    },
    {
      label: "Active Orders",
      value: stats ? String(stats.activeOrders) : "—",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.label} className="bg-white border rounded-2xl p-4">
          <p className="text-sm text-gray-500">{item.label}</p>
          <p className="text-2xl font-bold">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export default StoreStats;