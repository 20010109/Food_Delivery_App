import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase.js";
import {
  LuUser, LuRefreshCw, LuLogOut, LuMapPin, LuHouse,
  LuPackage, LuClock, LuCircleCheck, LuChevronRight,
} from "react-icons/lu";

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
  assigned:  { label: "Assigned",  color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  picked_up: { label: "Picked Up", color: "bg-blue-50 text-blue-700 border-blue-200" },
  delivered: { label: "Delivered", color: "bg-green-50 text-green-700 border-green-200" },
};

export default function RiderDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("pool");
  const [pool, setPool] = useState([]);
  const [active, setActive] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [toggling, setToggling] = useState(false);
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
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
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
  useEffect(() => { if (active && tab === "pool") setTab("active"); }, [active]);

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
      setToggling(true);
      const newStatus = riderProfile?.availability_status === "online" ? "offline" : "online";
      await post("/availability", { status: newStatus }, "PATCH");
      setRiderProfile((p) => ({ ...p, availability_status: newStatus }));
    } catch (err) {
      alert(err.message);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <LuRefreshCw size={24} className="text-gray-300 animate-spin" />
        <p className="text-sm text-gray-400">Loading dashboard...</p>
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
      <div className="bg-white border-b border-gray-100 px-4 pt-10 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Hey, {riderProfile?.first_name || "Rider"} 👋
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date().toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>

          {/* Online/Offline toggle switch */}
          <button
            onClick={handleToggleAvailability}
            disabled={toggling}
            className={`flex items-center gap-2.5 pl-3 pr-1.5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 border ${
              isOnline
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-100 text-gray-500 border-gray-200"
            } ${toggling ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <span>{isOnline ? "Online" : "Offline"}</span>
            {/* Toggle pill */}
            <div className={`w-10 h-6 rounded-full flex items-center transition-colors duration-200 px-0.5 ${
              isOnline ? "bg-green-500" : "bg-gray-300"
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
                isOnline ? "translate-x-4" : "translate-x-0"
              }`} />
            </div>
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "In Pool", value: pool.length, color: "text-gray-900" },
            { label: "Today", value: todayDeliveries, color: "text-blue-600" },
            { label: "Total", value: history.length, color: "text-green-600" },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-100">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
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
                tab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 py-4 space-y-3 pb-28">

        {/* ===== POOL TAB ===== */}
        {tab === "pool" && (
          <>
            {active && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-yellow-700 flex items-start gap-2">
                <LuPackage size={16} className="mt-0.5 shrink-0" />
                You have an active delivery. Complete it before claiming a new one.
              </div>
            )}

            {!isOnline && (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <LuClock size={28} className="text-gray-400" />
                </div>
                <p className="font-semibold text-gray-700">You're currently offline</p>
                <p className="text-sm text-gray-400">Toggle online above to start receiving orders.</p>
              </div>
            )}

            {isOnline && pool.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <LuPackage size={28} className="text-gray-400" />
                </div>
                <p className="font-semibold text-gray-700">No orders available</p>
                <p className="text-sm text-gray-400">Hang tight — new orders will appear here.</p>
              </div>
            )}

            {isOnline && pool.map((order) => (
              <div key={order.order_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Restaurant */}
                <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-50">
                  <img
                    src={order.restaurants?.profile_image}
                    className="w-11 h-11 rounded-xl object-cover bg-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{order.restaurants?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{fmt(order.restaurants?.addresses)}</p>
                  </div>
                  <span className="text-base font-bold text-red-600 shrink-0">
                    ₱{Number(order.total_price).toFixed(2)}
                  </span>
                </div>

                {/* Items */}
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-xs text-gray-400 mb-1">
                    {order.order_items?.length} item{order.order_items?.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {order.order_items?.map((i) => `${i.menu_items?.name} ×${i.quantity}`).join(", ")}
                  </p>
                </div>

                {/* Customer */}
                <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
                  <LuHouse size={14} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {order.user_profiles?.first_name} {order.user_profiles?.last_name}
                    </p>
                    <p className="text-xs text-gray-400">{order.user_profiles?.contact_number}</p>
                  </div>
                </div>

                {/* Claim */}
                <div className="px-4 py-3">
                  <button
                    onClick={() => handleClaim(order.order_id)}
                    disabled={!!active || claiming === order.order_id}
                    className="w-full bg-gray-900 hover:bg-gray-700 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-40 transition"
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
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <LuCircleCheck size={28} className="text-gray-400" />
                </div>
                <p className="font-semibold text-gray-700">No active delivery</p>
                <button onClick={() => setTab("pool")} className="text-sm text-red-600 font-semibold">
                  Browse available orders →
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Status badge */}
                <div className={`px-4 py-3 flex items-center justify-between border-b ${DELIVERY_STATUS[active.status]?.color}`}>
                  <span className="text-sm font-semibold">{DELIVERY_STATUS[active.status]?.label}</span>
                  <span className="text-xs font-mono opacity-70">#{active.order?.order_id?.slice(-8).toUpperCase()}</span>
                </div>

                {/* Pickup */}
                <div className="px-4 py-4 border-b border-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-red-50 rounded-full flex items-center justify-center shrink-0">
                      <LuMapPin size={16} className="text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Pick up from</p>
                      <p className="font-semibold text-gray-900">{active.order?.restaurants?.name}</p>
                      <p className="text-sm text-gray-500">{fmt(active.order?.restaurants?.addresses)}</p>
                    </div>
                  </div>
                </div>

                {/* Dropoff */}
                <div className="px-4 py-4 border-b border-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                      <LuHouse size={16} className="text-green-600" />
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
                  <p className="text-xs text-gray-400 font-medium">Order items</p>
                  {active.order?.order_items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.menu_items?.name} ×{item.quantity}</span>
                      <span className="text-gray-500">₱{(item.menu_items?.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-100">
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
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold disabled:opacity-50 transition"
                    >
                      {updating ? "Updating..." : "Confirm Pick Up"}
                    </button>
                  )}
                  {active.status === "picked_up" && (
                    <button
                      onClick={() => handleStatusUpdate(active.delivery_id, "delivered")}
                      disabled={updating}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-semibold disabled:opacity-50 transition"
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
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <LuClock size={28} className="text-gray-400" />
                </div>
                <p className="font-semibold text-gray-700">No deliveries yet</p>
                <p className="text-sm text-gray-400">Completed deliveries will appear here.</p>
              </div>
            ) : (
              history.map((d) => (
                <div key={d.delivery_id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
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
          onClick={() => navigate(`/rider/profile/${riderProfile?.user_id}`)}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition"
        >
          <LuUser size={20} />
          <span className="text-xs">Profile</span>
        </button>
        <button
          onClick={fetchAll}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition"
        >
          <LuRefreshCw size={20} />
          <span className="text-xs">Refresh</span>
        </button>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            localStorage.removeItem("grubero_user_profile");
            navigate("/login");
          }}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-red-500 transition"
        >
          <LuLogOut size={20} />
          <span className="text-xs">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

