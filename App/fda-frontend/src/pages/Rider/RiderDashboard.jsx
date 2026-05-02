import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase.js";

const API = "http://localhost:3000/api/rider";

const token = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
};

const fmt = (addr) => {
  if (!addr) return "No address on file";
  return [addr.house_no, addr.street, addr.barangay, addr.city]
    .filter(Boolean).join(", ");
};

const DELIVERY_STATUS = {
  assigned:  { label: "Assigned",  color: "bg-yellow-100 text-yellow-700" },
  picked_up: { label: "Picked Up", color: "bg-blue-100 text-blue-700" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700" },
};

export default function RiderDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("pool"); // pool | active | history
  const [pool, setPool] = useState([]);
  const [active, setActive] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [riderProfile, setRiderProfile] = useState(null);

  const get = useCallback(async (path) => {
    const t = await token();
    const res = await fetch(`${API}${path}`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }, []);

  const post = useCallback(async (path, body, method = "POST") => {
    const t = await token();
    const res = await fetch(`${API}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Request failed");
    }
    return res.json();
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [poolData, activeData, historyData, profileData] = await Promise.all([
        get("/pool"),
        get("/active"),
        get("/history"),
        get("/me"),
      ]);
      setPool(Array.isArray(poolData) ? poolData : []);
      console.log(activeData);
      setActive(activeData);
      setHistory(Array.isArray(historyData) ? historyData : []);
      setRiderProfile(profileData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Auto-switch to active tab when rider has an active delivery
  useEffect(() => {
    if (active && tab === "pool") setTab("active");
  }, [active]);

  const handleClaim = async (orderId) => {
    try {
      setClaiming(orderId);
      await post("/claim", { order_id: orderId });
      await fetchAll();
      setTab("active");
    } catch (err) {
      alert(err.message);
    } finally {
      setClaiming(null);
    }
  };

  const handleStatusUpdate = async (deliveryId, newStatus) => {
    try {
      setUpdating(true);
      await post("/status", { delivery_id: deliveryId, status: newStatus }, "PUT");
      await fetchAll();
      if (newStatus === "delivered") setTab("history");
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const newStatus = riderProfile?.availability_status === "online" ? "offline" : "online";
      await post("/availability", { status: newStatus }, "PATCH");
      setRiderProfile((p) => ({ ...p, availability_status: newStatus }));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  const isOnline = riderProfile?.availability_status === "online";
  const todayDeliveries = history.filter(
    (h) => h.delivery_time &&
      new Date(h.delivery_time).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 px-4 pt-10 pb-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Rider Dashboard</h1>
            <p className="text-xs text-gray-400">
              {new Date().toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>

          {/* Online/Offline toggle */}
          <button
            onClick={handleToggleAvailability}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${
              isOnline
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
            {isOnline ? "Online" : "Offline"}
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "In Pool", value: pool.length },
            { label: "Today", value: todayDeliveries },
            { label: "Total", value: history.length },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {[
            { key: "pool", label: `Pool (${pool.length})` },
            { key: "active", label: active ? "Active ●" : "Active" },
            { key: "history", label: `History (${history.length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                tab === t.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 py-4 space-y-3 pb-24">

        {/* ===== POOL TAB ===== */}
        {tab === "pool" && (
          <>
            {active && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-yellow-700">
                You have an active delivery. Complete it before claiming a new one.
              </div>
            )}

            {!isOnline && (
              <div className="bg-gray-100 rounded-2xl p-4 text-sm text-gray-500 text-center">
                Go online to see available orders.
              </div>
            )}

            {isOnline && pool.length === 0 && (
              <div className="text-center py-16 text-gray-400 text-sm">
                No orders available right now.
                <br />
                <span className="text-xs">Check back in a moment.</span>
              </div>
            )}

            {isOnline && pool.map((order) => (
              <div key={order.order_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Restaurant */}
                <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-50">
                  <img
                    src={order.restaurants?.profile_image}
                    className="w-10 h-10 rounded-xl object-cover bg-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{order.restaurants?.name}</p>
                    <p className="text-xs text-gray-400">{order.restaurants?.contact_info}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {fmt(order.restaurants?.addresses)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-red-600 shrink-0">
                    ₱{Number(order.total_price).toFixed(2)}
                  </span>
                </div>

                {/* Items summary */}
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-xs text-gray-400 mb-1">
                    {order.order_items?.length} item{order.order_items?.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {order.order_items?.map((i) => `${i.menu_items?.name} x${i.quantity}`).join(", ")}
                  </p>
                </div>

                {/* Customer */}
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-xs text-gray-400">Deliver to</p>
                  <p className="text-sm font-medium text-gray-800">
                    {order.user_profiles?.first_name} {order.user_profiles?.last_name}
                  </p>
                  <p className="text-xs text-gray-400">{order.user_profiles?.contact_number}</p>
                </div>

                {/* Claim */}
                <div className="px-4 py-3">
                  <button
                    onClick={() => handleClaim(order.order_id)}
                    disabled={!!active || claiming === order.order_id}
                    className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-gray-700 transition"
                  >
                    {claiming === order.order_id ? "Claiming..." : "Accept Delivery"}
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ===== ACTIVE TAB ===== */}
        {tab === "active" && (
          <>
            {!active ? (
              <div className="text-center py-16 text-gray-400 text-sm">
                No active delivery.
                <br />
                <button
                  onClick={() => setTab("pool")}
                  className="mt-3 text-red-600 font-semibold text-sm"
                >
                  Browse available orders →
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Status badge */}
                <div className={`px-4 py-3 flex items-center justify-between ${DELIVERY_STATUS[active.status]?.color}`}>
                  <span className="text-sm font-semibold">
                    {DELIVERY_STATUS[active.status]?.label}
                  </span>
                  <span className="text-xs">
                    Order #{active.order?.order_id?.slice(-8).toUpperCase()}
                  </span>
                </div>

                {/* Pickup */}
                <div className="px-4 py-4 border-b border-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-red-600 text-xs">📍</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Pick up from</p>
                      <p className="font-semibold text-gray-900">{active.order?.restaurants?.name}</p>
                      <p className="text-sm text-gray-500">
                        {fmt(active.order?.restaurants?.addresses)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dropoff */}
                <div className="px-4 py-4 border-b border-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-green-600 text-xs">🏠</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Deliver to</p>
                      <p className="font-semibold text-gray-900">
                        {active.customerProfile?.first_name} {active.customerProfile?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{fmt(active.customerAddress)}</p>
                      <p className="text-sm text-gray-400">{active.customerProfile?.contact_number}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="px-4 py-4 border-b border-gray-50 space-y-2">
                  <p className="text-xs text-gray-400">Order items</p>
                  {active.order?.order_items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.menu_items?.name} x{item.quantity}</span>
                      <span className="text-gray-500">₱{(item.menu_items?.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-bold pt-1 border-t border-gray-50">
                    <span>Total</span>
                    <span className="text-red-600">₱{Number(active.order?.total_price).toFixed(2)}</span>
                  </div>
                </div>

                {/* Action button */}
                <div className="px-4 py-4">
                  {active.status === "assigned" && (
                    <button
                      onClick={() => handleStatusUpdate(active.delivery_id, "picked_up")}
                      disabled={updating}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                    >
                      {updating ? "Updating..." : "Confirm Pick Up"}
                    </button>
                  )}
                  {active.status === "picked_up" && (
                    <button
                      onClick={() => handleStatusUpdate(active.delivery_id, "delivered")}
                      disabled={updating}
                      className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                    >
                      {updating ? "Updating..." : "Mark as Delivered"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ===== HISTORY TAB ===== */}
        {tab === "history" && (
          <>
            {history.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">
                No completed deliveries yet.
              </div>
            ) : (
              history.map((d) => (
                <div key={d.delivery_id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                  <img
                    src={d.order?.restaurants?.profile_image}
                    className="w-12 h-12 rounded-xl object-cover bg-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{d.order?.restaurants?.name}</p>
                    <p className="text-xs text-gray-400">
                      {d.delivery_time
                        ? new Date(d.delivery_time).toLocaleDateString("en-PH", {
                            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                          })
                        : "—"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900">₱{Number(d.order?.total_price).toFixed(2)}</p>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Delivered</span>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-100 px-6 py-3 flex justify-around">
        <button
          onClick={() => navigate(`/profile/${riderProfile?.user_id}`)}
          className="flex flex-col items-center gap-1 text-gray-400"
        >
          <span className="text-lg">👤</span>
          <span className="text-xs">Profile</span>
        </button>
        <button
          onClick={fetchAll}
          className="flex flex-col items-center gap-1 text-gray-400"
        >
          <span className="text-lg">↻</span>
          <span className="text-xs">Refresh</span>
        </button>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            localStorage.removeItem("grubero_user_profile");
            navigate("/login");
          }}
          className="flex flex-col items-center gap-1 text-gray-400"
        >
          <span className="text-lg">🚪</span>
          <span className="text-xs">Sign Out</span>
        </button>
      </div>
    </div>
  );
}