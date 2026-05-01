import AdminNavbar from "../components/Admin/AdminNavbar";
import AdminSidebar from "../components/Admin/AdminSidebar";
import StatCard from "../components/Admin/StatCard";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase";
import { LuUsers, LuStore, LuShoppingCart, LuBanknote} from "react-icons/lu";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

function AdminHomePage() {
  const [stats, setStats] = useState({
    users: 0,
    restaurants: 0,
    orders: 0,
    revenue: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [bannedUsers, setBannedUsers] = useState(0);
  const [adminName, setAdminName] = useState("Admin");
  const [userId, setUserId] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [ordersChartData, setOrdersChartData] = useState([]);
  const [summary, setSummary] = useState({ onDelivery: 0, delivered: 0, cancelled: 0 });
  const [activeTab, setActiveTab] = useState("Monthly");
  const navigate = useNavigate();

  useEffect(() =>{ 
    fetchStats();
    fetchRecentOrders();
    fetchAdminProfile();
    fetchChartData();
    fetchOrdersChart();
  }, []);

  const fetchAdminProfile = async () => {
    const { data: authData} = await supabase.auth.getUser();
    if(!authData?.user) return;
    setUserId(authData.user.id);

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("first_name")
      .eq("user_id", authData.user.id)
      .maybeSingle();

      if (profile?.first_name) setAdminName(profile.first_name);
  };


  const fetchStats = async () => {
    const [
      { count: users}, 
      { count: restaurants}, 
      {count : orders},
      {count : pending},
      {count: banned},
    ] = await Promise.all([
      supabase.from("user_profiles").select("*", { count: "exact", head: true}),
      supabase.from("restaurants").select("*", {count: "exact", head: true }),
      supabase.from("orders").select("*", {count: "exact", head: true}),
      supabase.from("restaurants").select("*", {count: "exact", head: true}).eq("status", "pending",),
      supabase.from("user_profiles").select("*", {count: "exact", head: true}).eq("is_active", false),
    ]);

    setPendingCount(pending || 0);
    setBannedUsers(banned || 0);

    const { data: revenueData} = await supabase
      .from("orders")
      .select("total_price");

      const revenue = revenueData?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0;

      setStats({
        users: users || 0,
        restaurants: restaurants || 0,
        orders: orders || 0,
        revenue,
      });
  };

const fetchRecentOrders = async () => {
  const { data, error} = await supabase
    .from("orders")
    .select("order_id, total_price, status, created_at, user_id")
    .order("created_at", {ascending: false})
    .limit(5);

    if (error) return console.error(error);
    setRecentOrders(data);
};

const fetchChartData = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select("total_price, created_at");

  if (error) return console.error(error);

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const grouped = {};
  MONTHS.forEach((m) => (grouped[m] = 0));

  data.forEach((order) => {
    const month = MONTHS[new Date(order.created_at).getMonth()];
    grouped[month] += Number(order.total_price || 0);
  });

  setChartData(MONTHS.map((month) => ({ month, revenue: grouped[month] })));
};

const fetchOrdersChart = async () => {
  const { data, error } = await supabase.from("orders").select("status, created_at");
  if (error) return console.error(error);

  // Summary pill counts
  const onDelivery = data.filter((o) => o.status === "out_for_delivery").length;
  const delivered = data.filter((o) => o.status === "completed").length;
  const cancelled = data.filter((o) => o.status === "cancelled").length;
  setSummary({ onDelivery, delivered, cancelled });

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const grouped = {};
  MONTHS.forEach((m) => (grouped[m] = { month: m, completed: 0, cancelled: 0, pending: 0 }));

  data.forEach((order) => {
    const month = MONTHS[new Date(order.created_at).getMonth()];
    if (order.status === "completed") grouped[month].completed++;
    else if (order.status === "cancelled") grouped[month].cancelled++;
    else grouped[month].pending++;
  });

  setOrdersChartData(MONTHS.map((m) => grouped[m]));
};

const statusColor = (status) => {
  const map = {
    pending: "text-yellow-500",
    preparing: "text-blue-500",
    out_for_delivery: "text-purple-500",
    completed: "text-green-500",
    cancelled: "text-red-500",
  };

  return map[status] || "text-gray-500";
};



  return (
    <div className="flex h-screen bg-[#f7f7fb]">

      <AdminSidebar />

      <div className="flex-1 flex flex-col">

        <AdminNavbar adminName={adminName} pageTitle="Dashboard" pendingCount={pendingCount} userId={userId}/>

        <main className="p-6 overflow-auto">
          <h1 className="text-2xl font-bold mb-1">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 text-sm mb-6">Welcome back, {adminName}</p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard title="Total Users" value={stats.users.toLocaleString()} icon={<LuUsers />} />
            <StatCard title="Total Revenue" value={`₱${stats.revenue.toLocaleString()}`} icon={<LuBanknote />} />
            <StatCard title="Total Orders" value={stats.orders.toLocaleString()} icon={<LuShoppingCart />} />
            <StatCard title="Total Restaurants" value={stats.restaurants.toLocaleString()} icon={<LuStore />} />

          </div>

          {/* Summary pills */}
          <div className="grid grid-cols-3 xl:grid-cols-6 gap-4 mb-5">
            <div onClick={() => navigate("/admin/analytics")} className="bg-white rounded-2xl shadow-sm py-4 flex flex-col items-center cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all">
              <p className="text-3xl font-bold text-red-600">{summary.onDelivery}</p>
              <p className="text-xs text-gray-400 mt-1">On Delivery</p>
            </div>
            <div onClick={() => navigate("/admin/analytics")} className="bg-white rounded-2xl shadow-sm py-4 flex flex-col items-center cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all">
              <p className="text-3xl font-bold text-green-500">{summary.delivered}</p>
              <p className="text-xs text-gray-400 mt-1">Delivered</p>
            </div>
            <div onClick={() => navigate("/admin/analytics")} className="bg-white rounded-2xl shadow-sm py-4 flex flex-col items-center cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all">
              <p className="text-3xl font-bold text-gray-700">{summary.cancelled}</p>
              <p className="text-xs text-gray-400 mt-1">Cancelled</p>
            </div>
            <div onClick={() => navigate("/admin/analytics")} className="bg-white rounded-2xl shadow-sm py-4 flex flex-col items-center cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all">
              <p className="text-3xl font-bold text-indigo-500">₱{stats.revenue.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">Total Revenue</p>
            </div>
            <div onClick={() => navigate("/admin/restaurants")} className="bg-white rounded-2xl shadow-sm py-4 flex flex-col items-center cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all">
              <p className="text-3xl font-bold text-amber-500">{pendingCount}</p>
              <p className="text-xs text-gray-400 mt-1">Pending Restaurants</p>
            </div>
            <div onClick={() => navigate("/admin/users")} className="bg-white rounded-2xl shadow-sm py-4 flex flex-col items-center cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all">
              <p className="text-3xl font-bold text-gray-400">{bannedUsers}</p>
              <p className="text-xs text-gray-400 mt-1">Inactive Users</p>
            </div>
          </div>

          {/* Charts row — Revenue + Orders */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">

            <div className="bg-white rounded-2xl shadow p-5">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h2 className="font-semibold text-lg">Revenue</h2>
                  <p className="text-xs text-gray-400">Monthly income overview</p>
                </div>
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 text-xs">
                  {["Monthly", "Weekly", "Today"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={`px-3 py-1 rounded-lg transition font-medium ${
                        activeTab === t ? "bg-white text-red-600 shadow-sm" : "text-gray-400"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-3 mb-4">₱{stats.revenue.toLocaleString()}</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => `₱${Number(v).toLocaleString()}`} />
                  <Line type="monotone" dataKey="revenue" stroke="#dc2626" strokeWidth={2.5} dot={{ fill: "#dc2626", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow p-5">
              <h2 className="font-semibold text-lg mb-1">Orders Summary</h2>
              <p className="text-xs text-gray-400 mb-4">Completed vs Cancelled per month</p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ordersChartData} barSize={10}>
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
            </div>

          </div>

          {/* Recent Orders table */}
          <div className="bg-white rounded-2xl shadow p-5 mb-5">
            <h2 className="font-semibold text-lg mb-4">Recent Orders</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-left border-b">
                  <th className="pb-2">Order ID</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.order_id} className="border-b last:border-0">
                    <td className="py-3 text-gray-600">#{order.order_id.slice(0, 8)}</td>
                    <td className="py-3 text-gray-600">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="py-3 font-semibold">₱{Number(order.total_price || 0).toLocaleString()}</td>
                    <td className={`py-3 font-medium capitalize ${statusColor(order.status)}`}>{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </main>
      </div>
    </div>
  );
}

export default AdminHomePage;