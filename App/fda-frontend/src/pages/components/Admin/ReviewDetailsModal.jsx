import React from "react";
import { LuX, LuStar, LuTrash2 } from "react-icons/lu";

const ReviewDetailsModal = ({ review, isOpen, onClose, onDelete }) => {
  if (!isOpen || !review) return null;

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <LuStar
            key={i}
            size={24}
            className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Review Details</h2>
            <p className="text-gray-500 text-sm mt-1">#{review.review_id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <LuX size={24} />
          </button>
        </div>

        {/* Rating Display */}
        <div className="mb-8">
          <p className="text-gray-600 text-sm font-medium mb-2">Rating</p>
          {renderStars(review.rating)}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Customer Information */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Information</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm">Name</p>
            <p className="text-gray-900 font-medium">
              {review.user_profiles?.first_name} {review.user_profiles?.last_name}
            </p>
            <p className="text-gray-600 text-sm mt-3">Contact</p>
            <p className="text-gray-900 font-medium">
              {review.user_profiles?.contact_number || "N/A"}
            </p>
          </div>
        </div>

        {/* Restaurant Information */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Restaurant Information</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm">Name</p>
            <p className="text-gray-900 font-medium">
              {review.restaurants?.name}
            </p>
            <p className="text-gray-600 text-sm mt-3">Contact</p>
            <p className="text-gray-900 font-medium">
              {review.restaurants?.contact_info || "N/A"}
            </p>
          </div>
        </div>

        {/* Review Comment */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Review Comment</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed">
              {review.comment}
            </p>
          </div>
        </div>

        {/* Review Date */}
        <div className="mb-8">
          <p className="text-gray-600 text-sm font-medium">Review Date</p>
          <p className="text-gray-900 mt-1">
            {new Date(review.created_at).toLocaleDateString()} at{" "}
            {new Date(review.created_at).toLocaleTimeString()}
          </p>
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
            onClick={() => {
              onDelete(review.review_id);
              onClose();
            }}
            className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
          >
            <LuTrash2 size={18} />
            Delete Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailsModal;
