import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase.js";

function RiderDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDeliveries();
    fetchHistory();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:3000/api/rider/deliveries", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDeliveries(data);
      }
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch("http://localhost:3000/api/rider/history", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleStatusUpdate = async (deliveryId, newStatus) => {
    setUpdatingId(deliveryId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch("http://localhost:3000/api/rider/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          delivery_id: deliveryId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        // Refresh the deliveries list
        fetchDeliveries();
        fetchHistory();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

const getRestaurantAddress = (delivery) => {
    if (!delivery.order?.restaurants?.addresses) return "No address";
    const addr = delivery.order.restaurants.addresses;
    return `${addr.house_no || ""} ${addr.street || ""}, ${addr.barangay || ""}, ${addr.city || ""}`;
  };

  const getCustomerAddress = (delivery) => {
    // Try to get customer address from the enriched customerAddress field
    if (delivery.customerAddress) {
      const addr = delivery.customerAddress;
      return `${addr.house_no || ""} ${addr.street || ""}, ${addr.barangay || ""}, ${addr.city || ""}`;
    }
    // Fallback to order user contact info
    if (delivery.order?.user) {
      return `${delivery.order.user.first_name} ${delivery.order.user.last_name} - ${delivery.order.user.contact_number}`;
    }
    return "No address";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "assigned":
        return "bg-yellow-100 text-yellow-800";
      case "picked_up":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Rider Dashboard</h1>
          <button
            onClick={() => navigate("/profile")}
            className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50"
          >
            Profile
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="text-gray-500 text-sm">Active Deliveries</div>
            <div className="text-3xl font-bold text-gray-800">{deliveries.length}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="text-gray-500 text-sm">Completed Today</div>
            <div className="text-3xl font-bold text-gray-800">
              {history.filter(
                (h) =>
                  h.delivery_time &&
                  new Date(h.delivery_time).toDateString() === new Date().toDateString()
              ).length}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-6 py-2 rounded-full font-semibold transition ${
              activeTab === "active"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Active ({deliveries.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-2 rounded-full font-semibold transition ${
              activeTab === "history"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            History ({history.length})
          </button>
        </div>

        {/* Delivery List */}
        <div className="space-y-4">
          {(activeTab === "active" ? deliveries : history).length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="text-gray-500 text-lg">
                {activeTab === "active"
                  ? "No active deliveries"
                  : "No delivery history"}
              </div>
            </div>
          ) : (
            (activeTab === "active" ? deliveries : history).map((delivery) => (
              <div
                key={delivery.delivery_id}
                className="bg-white p-4 rounded-xl shadow-md"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {delivery.order?.restaurants?.name || "Restaurant"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Order #{delivery.order?.order_id?.slice(0, 8)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                      delivery.status
                    )}`}
                  >
                    {delivery.status?.replace("_", " ")}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-red-500 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Pickup</p>
                      <p className="text-gray-800">
                        {getRestaurantAddress(delivery)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-green-500 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Delivery</p>
                      <p className="text-gray-800">
                        {delivery.order?.user?.first_name}{" "}
                        {delivery.order?.user?.last_name} -{" "}
                        {delivery.order?.user?.contact_number}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-gray-600">
                    <span className="font-semibold">
                      ₱{delivery.order?.total_price?.toFixed(2)}
                    </span>
                  </div>
                  {activeTab === "active" && (
                    <div className="flex gap-2">
                      {delivery.status === "assigned" && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(delivery.delivery_id, "picked_up")
                          }
                          disabled={updatingId === delivery.delivery_id}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                        >
                          {updatingId === delivery.delivery_id
                            ? "Updating..."
                            : "Picked Up"}
                        </button>
                      )}
                      {delivery.status === "picked_up" && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(delivery.delivery_id, "delivered")
                          }
                          disabled={updatingId === delivery.delivery_id}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                        >
                          {updatingId === delivery.delivery_id
                            ? "Updating..."
                            : "Delivered"}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-400 mt-2">
                  {formatDate(delivery.delivery_time)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default RiderDashboard;
