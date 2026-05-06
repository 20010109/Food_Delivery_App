import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuSearch, LuFilter, LuEye } from "react-icons/lu";
import { supabase } from "../../utils/supabase.js";
import AdminNavbar from "../../pages/components/Admin/AdminNavbar.jsx";
import AdminSidebar from "../../pages/components/Admin/AdminSidebar.jsx";
import OrderDetailsModal from "../../pages/components/Admin/OrderDetailsModal.jsx";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Fetch from Supabase directly since admin API endpoint doesn't exist yet
      const { data, error } = await supabase
        .from("orders")
        .select("*, user_profiles(*), restaurants(*), order_items(*, menu_items(*))")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_id?.toString().includes(searchTerm) ||
      order.user_profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminNavbar />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
              <p className="text-gray-600 mt-2">Manage all customer orders</p>
            </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <LuSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order ID or customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <LuFilter size={20} className="text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                Loading orders...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                No orders found
              </div>
            ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Restaurant
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.order_id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{order.order_id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.user_profiles?.first_name} {order.user_profiles?.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.restaurants?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ₱{parseFloat(order.total_price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }} className="inline-flex items-center gap-2 text-red-600 hover:text-red-700">
                          <LuEye size={18} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
            )}

            {/* Summary */}
            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter((o) => o.status === "pending").length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600 text-sm">Out for Delivery</p>
                <p className="text-2xl font-bold text-purple-600">
                  {orders.filter((o) => o.status === "out_for_delivery").length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter((o) => o.status === "completed").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        getStatusColor={getStatusColor}
      />
    </div>
)};

export default AdminOrdersPage;
