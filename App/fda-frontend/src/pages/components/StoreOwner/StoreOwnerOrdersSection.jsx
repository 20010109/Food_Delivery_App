import React, { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase.js";

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
    return <p className="text-gray-500 text-sm">Loading orders...</p>;
  }

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Orders</h2>
        <button
          onClick={fetchOrders}
          className="text-sm text-gray-500 hover:text-gray-800 border rounded-lg px-3 py-1"
        >
          ↻ Refresh
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
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

      {/* ORDERS LIST */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          No orders found.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const customer = order.user_profiles;

            return (
              <div
                key={order.order_id}
                className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4"
              >
                {/* ORDER HEADER */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Order #{order.order_id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                    {customer && (
                      <p className="text-sm text-gray-600 mt-1">
                        👤 {customer.first_name} {customer.last_name}
                        {customer.contact_number && (
                          <span className="ml-2 text-gray-400">
                            · {customer.contact_number}
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <span
                    className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${
                      STATUS_STYLES[order.status]
                    }`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>

                {/* ORDER ITEMS */}
                <div className="divide-y divide-gray-100">
                  {order.order_items?.map((item) => (
                    <div
                      key={item.order_item_id}
                      className="flex items-center gap-3 py-2"
                    >
                      {item.menu_items?.item_image && (
                        <img
                          src={item.menu_items.item_image}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.menu_items?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          x{item.quantity} · ₱{item.menu_items?.price}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-700 shrink-0">
                        ₱{(item.quantity * item.menu_items?.price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ORDER FOOTER */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <p className="font-bold text-gray-900">
                      Total: ₱{Number(order.total_price).toFixed(2)}
                  </p>

                  {order.status !== "completed" && order.status !== "cancelled" ? (
                      <select
                      disabled={updating === order.order_id}
                      value={order.status}
                      onChange={(e) =>
                          handleStatusUpdate(order.order_id, e.target.value)
                      }
                      className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white disabled:opacity-50 cursor-pointer"
                      >
                      <option value="pending">Pending</option>
                      <option value="preparing">Preparing</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      </select>
                  ) : (
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_STYLES[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                      </span>
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