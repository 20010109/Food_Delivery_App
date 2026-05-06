import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuArrowLeft, LuSearch, LuFilter, LuEye, LuMapPin } from "react-icons/lu";
import { supabase } from "../../utils/supabase";
import AdminNavbar from "../../pages/components/Admin/AdminNavbar.jsx";
import AdminSidebar from "../../pages/components/Admin/AdminSidebar.jsx";
import DeliveryDetailsModal from "../../pages/components/Admin/DeliveryDetailsModal.jsx";

const AdminDeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      // Fetch from Supabase directly
      const { data, error } = await supabase
        .from("deliveries")
        .select("*, orders(*, user_profiles(*))")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fetch rider profiles separately
      if (data && data.length > 0) {
        const riderIds = [...new Set(data.map(d => d.user_id).filter(Boolean))];
        if (riderIds.length > 0) {
          const { data: riders, error: ridersError } = await supabase
            .from("user_profiles")
            .select("*")
            .in("user_id", riderIds);
          
          if (!ridersError) {
            const riderMap = {};
            riders.forEach(r => riderMap[r.user_id] = r);
            const enrichedData = data.map(d => ({
              ...d,
              rider_profile: riderMap[d.user_id]
            }));
            setDeliveries(enrichedData);
          } else {
            setDeliveries(data);
          }
        } else {
          setDeliveries(data);
        }
      }
    } catch (err) {
      console.error("Error fetching deliveries:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch =
      delivery.delivery_id?.toString().includes(searchTerm) ||
      delivery.rider_profile?.first_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || delivery.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "picked_up":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
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
              <h1 className="text-3xl font-bold text-gray-900">Deliveries Management</h1>
              <p className="text-gray-600 mt-2">Track and manage all delivery orders</p>
            </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <LuSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by delivery ID or rider name..."
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
                <option value="assigned">Assigned</option>
                <option value="picked_up">Picked Up</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
        </div>

        {/* Deliveries Table */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                Loading deliveries...
              </div>
            ) : filteredDeliveries.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                No deliveries found
              </div>
            ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Delivery ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Rider
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Delivery Fee
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Assigned Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDeliveries.map((delivery) => (
                    <tr key={delivery.delivery_id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{delivery.delivery_id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        #{delivery.orders?.order_id || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {delivery.rider_profile ? (
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium">
                                {delivery.rider_profile.first_name} {delivery.rider_profile.last_name}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-yellow-600">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ₱{parseFloat(delivery.delivery_fee || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            delivery.status
                          )}`}
                        >
                          {delivery.status?.replace("_", " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {delivery.assigned_at
                          ? new Date(delivery.assigned_at).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button onClick={() => {
                          setSelectedDelivery(delivery);
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
                <p className="text-gray-600 text-sm">Total Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{deliveries.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600 text-sm">Assigned</p>
                <p className="text-2xl font-bold text-blue-600">
                  {deliveries.filter((d) => d.status === "assigned").length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600 text-sm">Delivered</p>
                <p className="text-2xl font-bold text-green-600">
                  {deliveries.filter((d) => d.status === "delivered").length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600 text-sm">Pending Assignment</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {deliveries.filter((d) => d.status === "pending").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Delivery Details Modal */}
      <DeliveryDetailsModal
        delivery={selectedDelivery}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        getStatusColor={getStatusColor}
      />
    </div>
)};

export default AdminDeliveriesPage;
