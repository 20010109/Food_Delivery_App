import React, { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase.js";
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { LuRefreshCw } from "react-icons/lu";

const STATUS_COLORS = {
  pending:          "#f59e0b",
  preparing:        "#3b82f6",
  out_for_delivery: "#8b5cf6",
  picked_up:        "#6366f1",
  completed:        "#10b981",
  cancelled:        "#ef4444",
};

const STATUS_LABELS = {
  pending:          "Pending",
  preparing:        "Preparing",
  out_for_delivery: "Out for Delivery",
  picked_up:        "Picked Up",
  completed:        "Completed",
  cancelled:        "Cancelled",
};

const PIE_COLORS = ["#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444", "#6366f1"];

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-300 mt-1">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <p className="font-semibold text-gray-800 text-sm">{title}</p>
      {children}
    </div>
  );
}

function StoreOwnerAnalytics({ restaurantId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(
        `http://localhost:3000/api/orders/storeowner/${restaurantId}/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      if (json?.error) throw new Error(json.error);
      setData(json);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) fetchData();
  }, [restaurantId]);

  if (loading) {
    return <div className="py-12 text-center text-gray-400 text-sm animate-pulse">Loading analytics...</div>;
  }

  if (error || !data) {
    return (
      <div className="py-12 text-center space-y-2">
        <p className="text-gray-400 text-sm">{error ?? "No data available."}</p>
        <button onClick={fetchData} className="text-xs text-red-500 underline">Retry</button>
      </div>
    );
  }

  // Defensive fallbacks so nothing crashes if backend returns old format
  const revenueByDay = Array.isArray(data.revenueByDay) ? data.revenueByDay : [];
  const ordersByDay  = Array.isArray(data.ordersByDay)  ? data.ordersByDay  : [];
  const ordersByStatus = Array.isArray(data.ordersByStatus) ? data.ordersByStatus : [];

  const totalOrders = ordersByStatus.reduce((s, x) => s + (x.count ?? 0), 0);
  const completedCount = ordersByStatus.find((s) => s.status === "completed")?.count ?? 0;
  const completionRate = totalOrders > 0 ? Math.round((completedCount / totalOrders) * 100) : 0;
  const peakDay = ordersByDay.length > 0
    ? ordersByDay.reduce((a, b) => (b.orders > a.orders ? b : a))
    : { orders: 0, date: "—" };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-400 mt-0.5">Last 7 days performance</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-xl px-3 py-2 transition hover:border-gray-400"
        >
          <LuRefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={totalOrders} />
        <StatCard
          label="Total Revenue"
          value={`₱${Number(data.totalRevenue ?? 0).toLocaleString()}`}
        />
        <StatCard label="Completion Rate" value={`${completionRate}%`} sub="completed orders" />
        <StatCard label="Busiest Day" value={peakDay.date} sub={`${peakDay.orders} orders`} />
      </div>

      {/* Revenue Chart */}
      <ChartCard title="Revenue — Last 7 Days">
        {revenueByDay.length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm">No revenue data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueByDay} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${v}`} />
              <Tooltip
                formatter={(v) => [`₱${Number(v).toLocaleString()}`, "Revenue"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #f3f4f6", fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#revGrad)"
                dot={{ r: 3, fill: "#ef4444" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Orders per Day + Status breakdown side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Orders Bar Chart */}
        <ChartCard title="Orders — Last 7 Days">
          {ordersByDay.length === 0 ? (
            <p className="text-center py-8 text-gray-400 text-sm">No order data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ordersByDay} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #f3f4f6", fontSize: 12 }} />
                <Bar dataKey="orders" fill="#ef4444" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Orders by Status Pie */}
        <ChartCard title="Orders by Status">
          {ordersByStatus.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No order data yet.</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {ordersByStatus.map((entry, i) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status] ?? PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, n) => [v, STATUS_LABELS[n] ?? n]}
                    contentStyle={{ borderRadius: 12, border: "1px solid #f3f4f6", fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex-1 space-y-2 min-w-0">
                {ordersByStatus.map((entry, i) => (
                  <div key={entry.status} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: STATUS_COLORS[entry.status] ?? PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="text-gray-500 truncate flex-1">{STATUS_LABELS[entry.status] ?? entry.status}</span>
                    <span className="font-semibold text-gray-800">{entry.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>

      </div>
    </div>
  );
}

export default StoreOwnerAnalytics;
