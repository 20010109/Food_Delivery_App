import React from "react";
import { LuX } from "react-icons/lu";


const PaymentDetailsModal = ({ payment, isOpen, onClose, getStatusColor, getPaymentMethodColor }) => {
    if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Payment Details</h2>
            <p className="text-gray-500 text-sm mt-1">#{payment.payment_id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <LuX size={24} />
          </button>
        </div>

        {/* Status & Method Badges */}
        <div className="flex gap-3 mb-8">
          <span
            className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
              payment.status
            )}`}
          >
            {payment.status?.toUpperCase()}
          </span>
          <span
            className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getPaymentMethodColor(
              payment.method
            )}`}
          >
            {payment.method?.replace("_", " ").toUpperCase()}
          </span>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Payment Amount */}
          <div>
            <p className="text-gray-600 text-sm font-medium">Amount</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              ₱{parseFloat(payment.amount).toFixed(2)}
            </p>
          </div>

          {/* Payment Date */}
          <div>
            <p className="text-gray-600 text-sm font-medium">Payment Date</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {new Date(payment.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Customer Information */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Information</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm">Name</p>
            <p className="text-gray-900 font-medium">
              {payment.orders?.user_profiles?.first_name} {payment.orders?.user_profiles?.last_name}
            </p>
            <p className="text-gray-600 text-sm mt-3">Contact</p>
            <p className="text-gray-900 font-medium">
              {payment.orders?.user_profiles?.contact_number || "N/A"}
            </p>
          </div>
        </div>

        {/* Order Information */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Order Information</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm">Order ID</p>
            <p className="text-gray-900 font-medium">
              #{payment.orders?.order_id || "N/A"}
            </p>
            <p className="text-gray-600 text-sm mt-3">Order Amount</p>
            <p className="text-gray-900 font-medium">
              ₱{parseFloat(payment.orders?.total_price || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-900 py-2.5 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Close
          </button>
          <button
            onClick={() => alert("Feature Not Available Yet.")}
            className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition font-medium"
            >
            Process Refund
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsModal;
