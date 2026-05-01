import React, { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import { supabase } from "../utils/supabase.js";
import {
  LuPackageCheck,
  LuReceiptText,
  LuRefreshCw,
  LuTruck,
  LuX,
} from "react-icons/lu";

const API_BASE = "http://localhost:3000/api";

const ACTIVE_STATUSES = ["pending", "preparing", "out_for_delivery"];
const PAST_STATUSES = ["delivered", "cancelled"];

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  if (!token) {
    throw new Error("You must be logged in to view orders.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function formatMoney(value) {
  return `₱${Number(value || 0).toLocaleString("en-PH")}`;
}

function formatDateTime(value) {
  if (!value) return "Date unavailable";

  return new Date(value).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function shortOrderCode(orderId) {
  return String(orderId || "").slice(0, 6).toUpperCase();
}

function statusLabel(status) {
  const labels = {
    pending: "Pending",
    preparing: "Preparing",
    out_for_delivery: "Out for delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  return labels[status] || status || "Unknown";
}

function statusColor(status) {
  if (status === "delivered") return "bg-green-100 text-green-700";
  if (status === "cancelled") return "bg-red-100 text-red-700";
  if (status === "out_for_delivery") return "bg-blue-100 text-blue-700";
  if (status === "preparing") return "bg-yellow-100 text-yellow-700";

  return "bg-red-50 text-red-600";
}

function progressWidth(status) {
  if (status === "pending") return "w-1/4";
  if (status === "preparing") return "w-2/4";
  if (status === "out_for_delivery") return "w-3/4";
  if (status === "delivered") return "w-full";

  return "w-1/4";
}

function etaMinutes(status) {
  if (status === "pending") return 45;
  if (status === "preparing") return 30;
  if (status === "out_for_delivery") return 15;

  return 0;
}

function getRestaurantName(order) {
  return order?.restaurants?.name || "Restaurant";
}

function getOrderItems(order) {
  return Array.isArray(order?.order_items) ? order.order_items : [];
}

function normalizeOrder(order) {
  const items = getOrderItems(order).map((item) => {
    const menuItem = item.menu_items || {};

    return {
      id: item.order_item_id || item.item_id,
      itemId: item.item_id,
      name: menuItem.name || `Item ${String(item.item_id).slice(0, 6)}`,
      qty: Number(item.quantity || 0),
      price: Number(menuItem.price || 0),
      image: menuItem.item_image || menuItem.image_url,
    };
  });

  return {
    ...order,
    id: order.order_id,
    orderCode: shortOrderCode(order.order_id),
    storeName: getRestaurantName(order),
    items,
    total: Number(order.total_price || 0),
    etaMinutes: etaMinutes(order.status),
    dateTime: formatDateTime(order.created_at),
    statusLabel: statusLabel(order.status),
    statusColor: statusColor(order.status),
  };
}

function TrackModal({
  open,
  onClose,
  order,
  onCancelOrder,
  cancellingOrderId,
}) {
  if (!open || !order) return null;

  const canCancel = order.status === "pending";
  const isCancelling = String(cancellingOrderId) === String(order.id);

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="absolute right-6 top-6 bottom-6 w-[440px] bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Track Order</h2>
            <p className="text-sm text-gray-500">Order #{order.orderCode}</p>
          </div>

          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center"
            aria-label="Close"
          >
            <LuX size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-auto h-full">
          <div className="rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-gray-900">{order.storeName}</div>
                <div className="text-sm text-gray-500 mt-1">
                  Placed {order.dateTime}
                </div>
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold ${order.statusColor}`}
              >
                {order.statusLabel}
              </span>
            </div>

            {ACTIVE_STATUSES.includes(order.status) && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>Estimated arrival</span>
                  <span className="font-semibold text-gray-900">
                    {order.etaMinutes} min
                  </span>
                </div>

                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full bg-red-500 ${progressWidth(
                      order.status
                    )}`}
                  />
                </div>
              </div>
            )}

            {canCancel && (
              <button
                type="button"
                onClick={() => onCancelOrder(order)}
                disabled={isCancelling}
                className="mt-4 w-full rounded-xl bg-red-50 py-3 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {isCancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 p-4">
            <h3 className="font-bold text-gray-900 mb-3">Status Timeline</h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                  <LuReceiptText size={16} />
                </div>
                <span>Order received</span>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    ["preparing", "out_for_delivery", "delivered"].includes(
                      order.status
                    )
                      ? "bg-red-50 text-red-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <LuPackageCheck size={16} />
                </div>
                <span>Preparing food</span>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    ["out_for_delivery", "delivered"].includes(order.status)
                      ? "bg-red-50 text-red-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <LuTruck size={16} />
                </div>
                <span>Out for delivery</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 p-4">
            <h3 className="font-bold text-gray-900 mb-3">Items</h3>

            <ul className="space-y-3 text-sm">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span className="text-gray-700">
                    {item.qty} × {item.name}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {item.price ? formatMoney(item.price * item.qty) : ""}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold">
              <span>Total</span>
              <span>{formatMoney(order.total)}</span>
            </div>
          </div>

          <button
            className="w-full py-3 rounded-2xl bg-gray-900 text-white font-semibold hover:bg-black transition"
            onClick={() => alert("Support/chat is not connected yet")}
          >
            Get Help
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [trackOpen, setTrackOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setOrdersError("");

      const headers = await getAuthHeaders();

      const res = await fetch(`${API_BASE}/orders/orders`, {
        headers,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load orders.");
      }

      setOrders(Array.isArray(data) ? data.map(normalizeOrder) : []);
    } catch (err) {
      setOrdersError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const cancelOrder = async (order) => {
    if (!order || order.status !== "pending") return;

    const confirmed = window.confirm(
      `Cancel order #${order.orderCode} from ${order.storeName}?`
    );

    if (!confirmed) return;

    try {
      setCancellingOrderId(order.id);
      setOrdersError("");

      const headers = await getAuthHeaders();

      const res = await fetch(`${API_BASE}/orders/order/${order.id}`, {
        method: "DELETE",
        headers,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to cancel order.");
      }

      await fetchOrders();

      if (activeOrder && String(activeOrder.id) === String(order.id)) {
        setActiveOrder(null);
        setTrackOpen(false);
      }
    } catch (err) {
      setOrdersError(err.message || "Failed to cancel order.");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const upcomingOrders = useMemo(() => {
    return orders.filter((order) => ACTIVE_STATUSES.includes(order.status));
  }, [orders]);

  const previousOrders = useMemo(() => {
    return orders.filter((order) => PAST_STATUSES.includes(order.status));
  }, [orders]);

  const openTrack = (order) => {
    setActiveOrder(order);
    setTrackOpen(true);
  };

  const closeTrack = () => {
    setTrackOpen(false);
    setActiveOrder(null);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Navbar />

      <main className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-500 mt-1">
              Track your current orders and review previous purchases.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <LuRefreshCw size={16} />
            Refresh
          </button>
        </div>

        {ordersError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600 font-medium">
            {ordersError}
          </div>
        )}

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-500">
            Loading orders...
          </div>
        ) : (
          <>
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Upcoming Orders
              </h2>

              {upcomingOrders.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-500">
                  No upcoming orders yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-bold text-gray-900">
                            {order.storeName}
                          </div>

                          <div className="text-sm text-gray-500 mt-1">
                            Estimated arrival
                          </div>

                          <div className="text-2xl font-bold mt-1">
                            {order.etaMinutes} min
                          </div>

                          <div className="text-xs text-gray-400 mt-1">
                            {order.items.length}{" "}
                            {order.items.length === 1 ? "item" : "items"} •{" "}
                            {formatMoney(order.total)}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            #{order.orderCode}
                          </div>

                          <button
                            className="mt-2 px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                            onClick={() => openTrack(order)}
                          >
                            Track
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full bg-red-500 ${progressWidth(
                            order.status
                          )}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Previous Orders
              </h2>

              {previousOrders.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-500">
                  No previous orders yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {previousOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-bold text-gray-900">
                          {order.storeName}
                        </div>

                        <span
                          className={`text-xs px-3 py-1 rounded-full font-semibold ${order.statusColor}`}
                        >
                          {order.statusLabel}
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 mt-2">
                        {order.dateTime}
                      </div>

                      <ul className="mt-4 text-sm text-gray-700 space-y-1">
                        {order.items.slice(0, 3).map((item) => (
                          <li key={item.id}>
                            {item.qty}x {item.name}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-4 text-sm font-bold text-gray-900">
                        Total: {formatMoney(order.total)}
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          className="flex-1 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold transition"
                          onClick={() => openTrack(order)}
                        >
                          Details
                        </button>

                        <button
                          className="flex-1 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-sm font-semibold text-red-600 transition"
                          onClick={() => alert("Help is not connected yet")}
                        >
                          Get Help
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <TrackModal
        open={trackOpen}
        onClose={closeTrack}
        order={activeOrder}
        onCancelOrder={cancelOrder}
        cancellingOrderId={cancellingOrderId}
      />
    </div>
  );
}