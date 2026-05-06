import React from "react";
import { LuX } from "react-icons/lu";

const DeliveryDetailsModal = ({ delivery, isOpen, onClose, getStatusColor }) => {
  if (!isOpen || !delivery) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Delivery Details</h2>
            <p className="text-gray-500 text-sm mt-1">#{delivery.delivery_id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <LuX size={24} />
          </button>
        </div>

        {/* Status Badge */}
        <div className="mb-8">
          <span
            className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
              delivery.status
            )}`}
          >
            {delivery.status?.replace("_", " ").toUpperCase()}
          </span>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Delivery Information */}
          <div className="space-y-6">
            <div>
              <p className="text-gray-600 text-sm font-medium">Delivery Fee</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₱{parseFloat(delivery.delivery_fee || 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Assigned Date</p>
              <p className="text-gray-900 mt-1">
                {delivery.assigned_at
                  ? new Date(delivery.assigned_at).toLocaleDateString()
                  : "Not assigned yet"}
              </p>
            </div>
          </div>

          {/* Order Information */}
          <div className="space-y-6">
            <div>
              <p className="text-gray-600 text-sm font-medium">Order ID</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                #{delivery.orders?.order_id || "N/A"}
              </p>
            </div>
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
              {delivery.orders?.user_profiles?.first_name}{" "}
              {delivery.orders?.user_profiles?.last_name}
            </p>
            <p className="text-gray-600 text-sm mt-3">Contact</p>
            <p className="text-gray-900 font-medium">
              {delivery.orders?.user_profiles?.contact_number || "N/A"}
            </p>
          </div>
        </div>

        {/* Rider Information */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Rider Information</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            {delivery.rider_profile ? (
              <>
                <p className="text-gray-600 text-sm">Name</p>
                <p className="text-gray-900 font-medium">
                  {delivery.rider_profile.first_name} {delivery.rider_profile.last_name}
                </p>
                <p className="text-gray-600 text-sm mt-3">Contact</p>
                <p className="text-gray-900 font-medium">
                  {delivery.rider_profile.contact_number || "N/A"}
                </p>
              </>
            ) : (
              <p className="text-yellow-600 font-medium">Rider not yet assigned</p>
            )}
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
          <button className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition font-medium">
            Edit Delivery
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetailsModal;
