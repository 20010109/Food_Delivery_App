import React, { useMemo, useState } from "react";
import Navbar from "./components/Navbar.jsx";

/**
 * TODO (backend):
 * - Replace these dummy arrays with API data:
 *   GET /orders?status=ongoing (for upcoming)
 *   GET /orders?status=completed,cancelled (for previous)
 * - Each order should include:
 *   id, storeName, status, etaMinutes, createdAt, items[], total, deliveryType, address, rider info, tracking coords
 */

function TrackModal({ open, onClose, order }) {
  if (!open || !order) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* modal */}
      <div className="absolute right-6 top-6 bottom-6 w-[420px] bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Track Order</h2>
            <p className="text-xs text-gray-500">
              {/* TODO (backend): show order code */}
              Order #{order.orderCode}
            </p>
          </div>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-auto h-full">
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="font-semibold">{order.storeName}</div>
            <div className="text-sm text-gray-500 mt-1">
              {/* TODO (backend): show delivery address */}
              Delivery to: <span className="font-medium">{order.address}</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              ETA: <span className="font-semibold">{order.etaMinutes} min</span>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="rounded-xl border border-gray-200 h-56 flex items-center justify-center text-gray-400">
            {/* TODO (backend): replace with map (Google Maps / Mapbox) using rider + destination coords */}
            Map placeholder
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold mb-3">Status</h3>

            {/* TODO (backend): status timeline from backend */}
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <span>Order confirmed</span>
                <span className="text-gray-500">{order.times.confirmed}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Preparing food</span>
                <span className="text-gray-500">{order.times.preparing}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-semibold">On the way</span>
                <span className="text-gray-500">{order.times.onTheWay}</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold mb-3">Items</h3>
            <ul className="space-y-2 text-sm">
              {order.items.map((it) => (
                <li key={it.name} className="flex justify-between">
                  <span>
                    {it.qty} × {it.name}
                  </span>
                  <span className="text-gray-600">₱{it.price}</span>
                </li>
              ))}
            </ul>
            <div className="border-t mt-3 pt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span>₱{order.total}</span>
            </div>
          </div>

          {/* TODO (backend): contact rider / support */}
          <button
            className="w-full py-3 rounded-xl bg-gray-900 text-white hover:bg-black transition"
            onClick={() => alert("Chat/Call rider not implemented yet")}
          >
            Call / Message Rider (placeholder)
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [trackOpen, setTrackOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  // Dummy data (safe to delete later)
  const upcomingOrders = useMemo(
    () => [
      {
        id: 1,
        orderCode: "1DF90E",
        storeName: "Burger King",
        etaMinutes: 35,
        address: "Banilad, Cebu City",
        items: [
          { name: "Yummy Food", qty: 1, price: 120 },
          { name: "Yummy Food", qty: 1, price: 120 },
        ],
        total: 240,
        times: { confirmed: "12:41", preparing: "12:44", onTheWay: "12:48" },
      },
      {
        id: 2,
        orderCode: "3EQAQ9",
        storeName: "McDonald's",
        etaMinutes: 60,
        address: "Banilad, Cebu City",
        items: [{ name: "Big Mac", qty: 1, price: 180 }],
        total: 180,
        times: { confirmed: "12:20", preparing: "12:28", onTheWay: "12:35" },
      },
    ],
    []
  );

  const previousOrders = useMemo(
    () => [
      {
        id: 10,
        storeName: "Burger King",
        date: "April 4, 2026",
        time: "11:45 PM",
        status: "Completed",
        statusColor: "bg-green-100 text-green-700",
        items: ["Yummy Food", "Yummy Food"],
      },
      {
        id: 11,
        storeName: "Burger King",
        date: "April 4, 2026",
        time: "11:45 PM",
        status: "Cancelled",
        statusColor: "bg-red-100 text-red-700",
        items: ["Yummy Food", "Yummy Food"],
      },
      {
        id: 12,
        storeName: "Burger King",
        date: "April 4, 2026",
        time: "11:45 PM",
        status: "Completed",
        statusColor: "bg-green-100 text-green-700",
        items: ["Yummy Food", "Yummy Food"],
      },
      {
        id: 13,
        storeName: "Burger King",
        date: "April 4, 2026",
        time: "11:45 PM",
        status: "Cancelled",
        statusColor: "bg-red-100 text-red-700",
        items: ["Yummy Food", "Yummy Food"],
      },
      {
        id: 14,
        storeName: "Burger King",
        date: "April 4, 2026",
        time: "11:45 PM",
        status: "Completed",
        statusColor: "bg-green-100 text-green-700",
        items: ["Yummy Food", "Yummy Food"],
      },
    ],
    []
  );

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

      {/* Only the content scrolls (Navbar stays fixed) */}
      <main className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* UPCOMING */}
        <section className="space-y-4">
          <h1 className="text-2xl font-bold">Upcoming Orders</h1>

          {/* TODO (backend): if upcomingOrders empty, show empty state */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingOrders.map((o) => (
              <div
                key={o.id}
                className="bg-white rounded-2xl border border-gray-200 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold">{o.storeName}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Estimated arrival
                    </div>
                    <div className="text-2xl font-bold mt-1">{o.etaMinutes} min</div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-500">#{o.orderCode}</div>
                    <button
                      className="mt-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                      onClick={() => openTrack(o)}
                    >
                      Track
                    </button>
                  </div>
                </div>

                {/* progress bar */}
                <div className="mt-4 h-2 rounded-full bg-gray-100 overflow-hidden">
                  {/* TODO (backend): progress based on status */}
                  <div className="h-full w-2/3 bg-red-500" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PREVIOUS */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Previous Orders</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {previousOrders.map((o) => (
              <div
                key={o.id}
                className="bg-white rounded-2xl border border-gray-200 p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="font-semibold">{o.storeName}</div>
                  <span className={`text-xs px-2 py-1 rounded-full ${o.statusColor}`}>
                    {o.status}
                  </span>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  {o.date} • {o.time}
                </div>

                <ul className="mt-3 text-sm text-gray-700 space-y-1">
                  {o.items.map((it, idx) => (
                    <li key={idx}>{it}</li>
                  ))}
                </ul>

                <div className="mt-4 flex gap-2">
                  <button
                    className="flex-1 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
                    onClick={() => alert("Details not implemented yet")}
                  >
                    Details
                  </button>
                  <button
                    className="flex-1 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-sm text-blue-700"
                    onClick={() => alert("Help not implemented yet")}
                  >
                    Get Help
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <TrackModal open={trackOpen} onClose={closeTrack} order={activeOrder} />
    </div>
  );
}