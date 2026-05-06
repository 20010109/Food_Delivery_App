import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuSearch, LuFilter, LuEye } from "react-icons/lu";
import { supabase } from "../../utils/supabase.js";
import AdminNavbar from "../../pages/components/Admin/AdminNavbar.jsx";
import AdminSidebar from "../../pages/components/Admin/AdminSidebar.jsx";
import PaymentDetailsModal from "../../pages/components/Admin/PaymentDetailsModal.jsx";

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // Fetch from Supabase directly since admin API endpoint doesn't exist yet
      const { data, error } = await supabase
        .from("payments")
        .select("*, orders(*, user_profiles(*))")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.payment_id?.toString().includes(searchTerm) ||
      payment.orders?.user_profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || payment.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case "credit_card":
        return "bg-purple-50 text-purple-700";
      case "gcash":
        return "bg-blue-50 text-blue-700";
      case "wallet":
        return "bg-green-50 text-green-700";
      case "cash":
        return "bg-orange-50 text-orange-700";
      default:
        return "bg-gray-50 text-gray-700";
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
              <h1 className="text-3xl font-bold text-gray-900">Payments Management</h1>
              <p className="text-gray-600 mt-2">Track and manage all payment transactions</p>
            </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <LuSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by payment ID or customer name..."
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
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                Loading payments...
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                No payments found
              </div>
            ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Payment ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Method
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
                  {filteredPayments.map((payment) => (
                    <tr key={payment.payment_id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{payment.payment_id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {payment.orders?.user_profiles?.first_name} {payment.orders?.user_profiles?.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        #{payment.orders?.order_id || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ₱{parseFloat(payment.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPaymentMethodColor(payment.payment_method)}`}>
                          {payment.payment_method?.replace("_", " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {payment.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button onClick={() => {
                          setSelectedPayment(payment);
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
                <p className="text-gray-600 text-sm">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600 text-sm">Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  ₱{payments
                    .filter((p) => p.status === "paid")
                    .reduce((sum, p) => sum + parseFloat(p.amount), 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {payments.filter((p) => p.status === "pending").length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600 text-sm">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {payments.filter((p) => p.status === "failed").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Payment Details Modal */}
      <PaymentDetailsModal
        payment={selectedPayment}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        getStatusColor={getStatusColor}
        getPaymentMethodColor={getPaymentMethodColor}
      />
    </div>
)};

export default AdminPaymentsPage;
