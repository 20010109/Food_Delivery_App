import React from "react";
import { LuX } from "react-icons/lu";

const OrderDetailsModal = ({ order, isOpen, onClose, getStatusColor }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Order Details</h2>
            <p className="text-gray-500 text-sm mt-1">#{order.order_id}</p>
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
              order.status
            )}`}
          >
            {order.status?.replace("_", " ").toUpperCase()}
          </span>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Order Amount */}
          <div>
            <p className="text-gray-600 text-sm font-medium">Total Amount</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              ₱{parseFloat(order.total_price).toFixed(2)}
            </p>
          </div>

          {/* Order Date */}
          <div>
            <p className="text-gray-600 text-sm font-medium">Order Date</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {new Date(order.created_at).toLocaleDateString()}
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
              {order.user_profiles?.first_name} {order.user_profiles?.last_name}
            </p>
            <p className="text-gray-600 text-sm mt-3">Contact</p>
            <p className="text-gray-900 font-medium">
              {order.user_profiles?.contact_number || "N/A"}
            </p>
          </div>
        </div>

        {/* Restaurant Information */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Restaurant Information</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm">Name</p>
            <p className="text-gray-900 font-medium">
              {order.restaurants?.name || "N/A"}
            </p>
            <p className="text-gray-600 text-sm mt-3">Contact</p>
            <p className="text-gray-900 font-medium">
              {order.restaurants?.contact_info || "N/A"}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Order Items</h3>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        {order.order_items && order.order_items.length > 0 ? (
            order.order_items.map((item, index) => (
            <div
                key={index}
                className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
            >
                {/* LEFT: Image + Info */}
                <div className="flex items-center gap-4">
                <img
                    src={item.menu_items?.item_image || "/placeholder-food.png"}
                    alt={item.menu_items?.name}
                    className="w-14 h-14 object-cover rounded-md"
                />

                <div>
                    <p className="font-semibold text-gray-900">
                    {item.menu_items?.name || "Item"}
                    </p>
                    <p className="text-sm text-gray-500">
                    Qty: {item.quantity}
                    </p>
                </div>
                </div>

                {/* RIGHT: Price */}
                <div className="text-right">
                <p className="font-semibold text-gray-900">
                    ₱{(item.menu_items?.price * item.quantity).toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">
                    ₱{item.menu_items?.price} each
                </p>
                </div>
            </div>
            ))
        ) : (
            <p className="text-gray-500 text-sm">No items found</p>
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
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
