import React, { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase.js";
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const STATUS_LABELS = {
  pending:          "Pending",
  preparing:        "Preparing",
  out_for_delivery: "Out for Delivery",
  picked_up:        "Picked Up",
  completed:        "Completed",
  cancelled:        "Cancelled",
};

const STATUS_DOT = {
  completed:        "bg-green-500",
  pending:          "bg-amber-400",
  preparing:        "bg-blue-500",
  out_for_delivery: "bg-purple-500",
  picked_up:        "bg-indigo-500",
  cancelled:        "bg-red-400",
};

function OverviewSummary({ restaurantId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) return;

    const fetch_ = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        if (!token) return;

        const res = await fetch(
          `http://localhost:3000/api/orders/storeowner/${restaurantId}/stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) return;
        const json = await res.json();
        if (json?.error) return;
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [restaurantId]);

  if (loading || !data) return null;

  const ordersByDay  = Array.isArray(data.ordersByDay)    ? data.ordersByDay    : [];
  const revenueByDay = Array.isArray(data.revenueByDay)   ? data.revenueByDay   : [];
  const ordersByStatus = Array.isArray(data.ordersByStatus) ? data.ordersByStatus : [];

  const weekRevenue  = revenueByDay.reduce((s, d) => s + (d.revenue ?? 0), 0);
  const weekOrders   = ordersByDay.reduce((s, d) => s + (d.orders ?? 0), 0);
  const completedCount = ordersByStatus.find((s) => s.status === "completed")?.count ?? 0;
  const cancelledCount = ordersByStatus.find((s) => s.status === "cancelled")?.count ?? 0;

  if (ordersByDay.length === 0 && ordersByStatus.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900 text-sm">Weekly Summary</p>
          <p className="text-xs text-gray-400">Last 7 days</p>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <p className="text-sm font-bold text-gray-900">₱{Number(weekRevenue).toLocaleString()}</p>
            <p className="text-xs text-gray-400">Revenue</p>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{weekOrders}</p>
            <p className="text-xs text-gray-400">Orders</p>
          </div>
          <div>
            <p className="text-sm font-bold text-green-600">{completedCount}</p>
            <p className="text-xs text-gray-400">Completed</p>
          </div>
          <div>
            <p className="text-sm font-bold text-red-400">{cancelledCount}</p>
            <p className="text-xs text-gray-400">Cancelled</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">

        {/* Orders bar chart */}
        <div className="col-span-2 p-5">
          <p className="text-xs text-gray-400 mb-3 font-medium">Orders per Day</p>
          {ordersByDay.length === 0 ? (
            <p className="text-center py-4 text-xs text-gray-300">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={ordersByDay} margin={{ top: 2, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #f3f4f6", fontSize: 11 }}
                />
                <Bar dataKey="orders" fill="#ef4444" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status breakdown */}
        <div className="p-5">
          <p className="text-xs text-gray-400 mb-3 font-medium">Orders by Status</p>
          {ordersByStatus.length === 0 ? (
            <p className="text-center py-4 text-xs text-gray-300">No data</p>
          ) : (
            <div className="space-y-2.5">
              {ordersByStatus.map((entry) => {
                const total = ordersByStatus.reduce((s, x) => s + x.count, 0);
                const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0;
                return (
                  <div key={entry.status}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${STATUS_DOT[entry.status] ?? "bg-gray-300"}`} />
                        <span className="text-gray-500">{STATUS_LABELS[entry.status] ?? entry.status}</span>
                      </div>
                      <span className="font-semibold text-gray-700">{entry.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${STATUS_DOT[entry.status] ?? "bg-gray-300"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default OverviewSummary;
