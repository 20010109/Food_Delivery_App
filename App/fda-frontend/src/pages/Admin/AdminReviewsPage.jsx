import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuSearch,
  LuFilter,
  LuEye,
  LuStar,
  LuTrash2,
} from "react-icons/lu";
import { supabase } from "../../utils/supabase.js";
import AdminNavbar from "../../pages/components/Admin/AdminNavbar.jsx";
import AdminSidebar from "../../pages/components/Admin/AdminSidebar.jsx";
import ReviewDetailsModal from "../../pages/components/Admin/ReviewDetailsModal.jsx";

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Fetch reviews with restaurants relationship
      const { data, error } = await supabase
        .from("reviews")
        .select("*, restaurants(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fetch user profiles separately for reviewers
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(r => r.user_id).filter(Boolean))];
        if (userIds.length > 0) {
          const { data: users, error: usersError } = await supabase
            .from("user_profiles")
            .select("*")
            .in("user_id", userIds);
          
          if (!usersError) {
            const userMap = {};
            users.forEach(u => userMap[u.user_id] = u);
            const enrichedData = data.map(r => ({
              ...r,
              user_profiles: userMap[r.user_id]
            }));
            setReviews(enrichedData);
          } else {
            setReviews(data);
          }
        } else {
          setReviews(data);
        }
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.user_profiles?.first_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      review.restaurants?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating =
      filterRating === "all" || review.rating === parseInt(filterRating);

    return matchesSearch && matchesRating;
  });

  const handleDeleteReview = async (review_id) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        const { error } = await supabase
          .from("reviews")
          .delete()
          .eq("review_id", review_id);

        if (error) throw error;
        setReviews(reviews.filter((r) => r.review_id !== review_id));
      } catch (err) {
        console.error("Error deleting review:", err);
        alert("Failed to delete review");
      }
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <LuStar
            key={i}
            size={16}
            className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
    );
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
              <h1 className="text-3xl font-bold text-gray-900">Reviews Management</h1>
              <p className="text-gray-600 mt-2">Monitor and manage customer reviews</p>
            </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <LuSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer, restaurant, or comment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <LuFilter size={20} className="text-gray-600" />
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                Loading reviews...
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                No reviews found
              </div>
            ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review.review_id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition cursor-pointer"
                onClick={() => {
                  setSelectedReview(review);
                  setShowModal(true);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {review.user_profiles?.first_name}{" "}
                        {review.user_profiles?.last_name}
                      </h3>
                      <span className="text-sm text-gray-500">→</span>
                      <p className="text-sm text-gray-600">
                        {review.restaurants?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                    <p className="text-xs text-gray-400 mt-3">
                      {new Date(review.created_at).toLocaleDateString()} at{" "}
                      {new Date(review.created_at).toLocaleTimeString()}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteReview(review.review_id)}
                    className="text-red-500 hover:text-red-700 transition p-2"
                    title="Delete review"
                  >
                    <LuTrash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
            )}

            {/* Summary */}
            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600 text-sm">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600 text-sm">Average Rating</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reviews.length > 0
                    ? (
                        reviews.reduce((sum, r) => sum + r.rating, 0) /
                        reviews.length
                      ).toFixed(1)
                    : "N/A"}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600 text-sm">5 Star Reviews</p>
                <p className="text-2xl font-bold text-green-600">
                  {reviews.filter((r) => r.rating === 5).length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600 text-sm">Low Rating Reviews</p>
                <p className="text-2xl font-bold text-orange-600">
                  {reviews.filter((r) => r.rating <= 2).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Review Details Modal */}
      <ReviewDetailsModal
        review={selectedReview}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onDelete={handleDeleteReview}
      />
    </div>
  );
};

export default AdminReviewsPage;
