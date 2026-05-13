import React, { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase.js";
import { LuRefreshCw, LuX } from "react-icons/lu";

const STATUS_STYLES = {
  pending:          "bg-yellow-100 text-yellow-700",
  preparing:        "bg-blue-100 text-blue-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  completed:        "bg-green-100 text-green-700",
  cancelled:        "bg-red-100 text-red-600",
};

const STATUS_LABELS = {
  pending:          "Pending",
  preparing:        "Preparing",
  out_for_delivery: "Out for Delivery",
  completed:        "Completed",
  cancelled:        "Cancelled",
};

function StoreOwnerOrdersSection({ restaurantId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState(null);

  const sessionToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };

  const fetchOrders = async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const token = await sessionToken();
      const res = await fetch(
        `http://localhost:3000/api/orders/storeowner/${restaurantId}/orders`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdating(orderId);
      const token = await sessionToken();
      const res = await fetch(
        `http://localhost:3000/api/orders/storeowner/${restaurantId}/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) throw new Error("Failed to update status");

      // Optimistically update locally
      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === orderId ? { ...o, status: newStatus } : o
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [restaurantId]);

  const filtered =
    filter === "all"
      ? orders
      : orders.filter((o) => o.status === filter);

  const tabs = ["all", "pending", "preparing", "out_for_delivery", "completed", "cancelled"];

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-400 text-sm animate-pulse">Loading orders...</div>
    );
  }

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-400 mt-0.5">{orders.length} total order{orders.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-xl px-3 py-2 transition hover:border-gray-400"
        >
          <LuRefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap gap-1.5">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              filter === tab
                ? "bg-gray-900 text-white border-gray-900"
                : "text-gray-500 border-gray-200 hover:border-gray-400"
            }`}
          >
            {tab === "all"
              ? `All (${orders.length})`
              : `${STATUS_LABELS[tab]} (${orders.filter((o) => o.status === tab).length})`}
          </button>
        ))}
      </div>

      {/* ORDERS */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No orders found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const customer = order.user_profiles;

            return (
              <div
                key={order.order_id}
                className="border border-gray-100 rounded-2xl p-5 space-y-3 hover:shadow-sm transition"
              >
                {/* ORDER HEADER */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Order #{order.order_id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                    {customer && (
                      <p className="text-sm text-gray-600 mt-1.5">
                        {customer.first_name} {customer.last_name}
                        {customer.contact_number && (
                          <span className="ml-2 text-gray-400 text-xs">· {customer.contact_number}</span>
                        )}
                      </p>
                    )}
                    {order.delivery?.user_profiles && (
                      <p className="text-sm text-blue-600 mt-1">
                        Rider: {order.delivery.user_profiles.first_name} {order.delivery.user_profiles.last_name}
                        {order.delivery.user_profiles.contact_number && (
                          <span className="ml-2 text-gray-400 text-xs">· {order.delivery.user_profiles.contact_number}</span>
                        )}
                      </p>
                    )}
                  </div>

                  <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${STATUS_STYLES[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>

                {/* ORDER ITEMS */}
                <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
                  {order.order_items?.map((item) => (
                    <div key={item.order_item_id} className="flex items-center gap-3 px-4 py-2.5 bg-gray-50">
                      {item.menu_items?.item_image && (
                        <img
                          src={item.menu_items.item_image}
                          className="w-9 h-9 rounded-lg object-cover bg-gray-200 shrink-0"
                          alt={item.menu_items?.name}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.menu_items?.name}</p>
                        <p className="text-xs text-gray-400">x{item.quantity} · ₱{item.menu_items?.price}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-700 shrink-0">
                        ₱{(item.quantity * item.menu_items?.price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ORDER FOOTER */}
                <div className="flex items-center justify-between pt-1">
                  <p className="font-bold text-gray-900">
                    Total: ₱{Number(order.total_price).toFixed(2)}
                  </p>
                  {order.status === "pending" && (
                    <button
                      onClick={() => handleStatusUpdate(order.order_id, "cancelled")}
                      disabled={updating === order.order_id}
                      className="flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 rounded-xl px-3 py-1.5 transition"
                    >
                      <LuX size={12} /> Cancel Order
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StoreOwnerOrdersSection;
