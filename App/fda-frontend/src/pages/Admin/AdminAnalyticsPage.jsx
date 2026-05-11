import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import AdminSidebar from "../components/Admin/AdminSidebar";
import AdminNavbar from "../components/Admin/AdminNavbar";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from "recharts";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const computeChartData = (data, tab) => {
  if (tab === "Monthly") {
    const grouped = {};
    MONTH_NAMES.forEach((m) => (grouped[m] = 0));
    data.forEach((order) => {
      const month = MONTH_NAMES[new Date(order.created_at).getMonth()];
      grouped[month] += Number(order.total_price || 0);
    });
    return MONTH_NAMES.map((month) => ({ label: month, revenue: grouped[month] }));
  }
  if (tab === "Weekly") {
    const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      result.push({ label: DAYS[d.getDay()], revenue: 0, date: d.toDateString() });
    }
    data.forEach((order) => {
      const entry = result.find((r) => r.date === new Date(order.created_at).toDateString());
      if (entry) entry.revenue += Number(order.total_price || 0);
    });
    return result.map(({ label, revenue }) => ({ label, revenue }));
  }
  if (tab === "Today") {
    const todayStr = new Date().toDateString();
    const hours = Array.from({ length: 24 }, (_, i) => ({
      label: i === 0 ? "12AM" : i < 12 ? `${i}AM` : i === 12 ? "12PM" : `${i - 12}PM`,
      revenue: 0,
    }));
    data.forEach((order) => {
      const d = new Date(order.created_at);
      if (d.toDateString() === todayStr) {
        hours[d.getHours()].revenue += Number(order.total_price || 0);
      }
    });
    return hours;
  }
  return [];
};

function AdminAnalyticsPage() {
  const [revenueData, setRevenueData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [rawOrders, setRawOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("Monthly");
  const [adminName, setAdminName] = useState("Admin");

  const [summary, setSummary] = useState({
    onDelivery: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchAdminProfile();
    fetchRevenueData();
    fetchOrdersData();
  }, []);

  useEffect(() => {
    if (rawOrders.length > 0) {
      setRevenueData(computeChartData(rawOrders, activeTab));
    }
  }, [activeTab]);

  const fetchAdminProfile = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return;

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("first_name")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (profile?.first_name) setAdminName(profile.first_name);
  };

  const fetchRevenueData = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("total_price, created_at");

    if (error) return console.error(error);

    const totalRevenue = data.reduce((sum, o) => sum + Number(o.total_price || 0), 0);
    setSummary((prev) => ({ ...prev, totalRevenue }));

    setRawOrders(data);
    setRevenueData(computeChartData(data, activeTab));
  };

  const fetchOrdersData = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("status, created_at");

    if (error) return console.error(error);

    // Summary counts
    const onDelivery = data.filter((o) => o.status === "out_for_delivery").length;
    const delivered = data.filter((o) => o.status === "completed").length;
    const cancelled = data.filter((o) => o.status === "cancelled").length;
    setSummary((prev) => ({ ...prev, onDelivery, delivered, cancelled }));

    // Group by month for bar chart
    const grouped = {};
    MONTH_NAMES.forEach((m) => (grouped[m] = { month: m, completed: 0, cancelled: 0, pending: 0 }));

    data.forEach((order) => {
      const month = MONTH_NAMES[new Date(order.created_at).getMonth()];
      if (order.status === "completed") grouped[month].completed++;
      else if (order.status === "cancelled") grouped[month].cancelled++;
      else grouped[month].pending++;
    });

    setOrdersData(MONTH_NAMES.map((m) => grouped[m]));
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar adminName={adminName} pageTitle="Analytics" />

        <main className="p-6 overflow-auto space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">Platform performance overview</p>
          </div>

          {/* Summary pills — matches image bottom stats */}
          <div className="flex gap-6">
            <div className="bg-white rounded-2xl shadow-sm px-6 py-4 flex flex-col items-center min-w-[120px]">
              <p className="text-3xl font-bold text-red-600">{summary.onDelivery}</p>
              <p className="text-xs text-gray-400 mt-1">On Delivery</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm px-6 py-4 flex flex-col items-center min-w-[120px]">
              <p className="text-3xl font-bold text-green-500">{summary.delivered}</p>
              <p className="text-xs text-gray-400 mt-1">Delivered</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm px-6 py-4 flex flex-col items-center min-w-[120px]">
              <p className="text-3xl font-bold text-gray-700">{summary.cancelled}</p>
              <p className="text-xs text-gray-400 mt-1">Cancelled</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm px-6 py-4 flex flex-col items-center min-w-[160px]">
              <p className="text-3xl font-bold text-indigo-500">₱{summary.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">Total Revenue</p>
            </div>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

            {/* Revenue Line Chart */}
            <section className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Revenue</h2>
                  <p className="text-xs text-gray-400">{activeTab === "Monthly" ? "Monthly income overview" : activeTab === "Weekly" ? "Last 7 days" : "Today by hour"}</p>
                </div>

                {/* Tab switcher matching image style */}
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 text-xs">
                  {["Monthly", "Weekly", "Today"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={`px-3 py-1 rounded-lg transition font-medium ${
                        activeTab === t
                          ? "bg-white text-red-600 shadow-sm"
                          : "text-gray-400"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-2xl font-bold text-gray-800 mt-3 mb-4">
                ₱{summary.totalRevenue.toLocaleString()}
              </p>

              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => `₱${Number(v).toLocaleString()}`} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#dc2626"
                    strokeWidth={2.5}
                    dot={{ fill: "#dc2626", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </section>

            {/* Orders Bar Chart */}
            <section className="bg-white rounded-2xl shadow-sm p-5">
              <div className="mb-1">
                <h2 className="text-lg font-semibold text-gray-800">Orders Summary</h2>
                <p className="text-xs text-gray-400">Completed vs Cancelled per month</p>
              </div>

              <ResponsiveContainer width="100%" height={270}>
                <BarChart data={ordersData} barSize={10}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="completed" fill="#dc2626" radius={[4, 4, 0, 0]} name="Completed" />
                  <Bar dataKey="cancelled" fill="#fca5a5" radius={[4, 4, 0, 0]} name="Cancelled" />
                  <Bar dataKey="pending" fill="#fee2e2" radius={[4, 4, 0, 0]} name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </section>

          </div>

        </main>
      </div>
    </div>
  );
}

export default AdminAnalyticsPage;