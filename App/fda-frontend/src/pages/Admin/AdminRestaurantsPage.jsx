import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../utils/supabase";
import AdminNavbar from "../components/Admin/AdminNavbar";
import AdminSidebar from "../components/Admin/AdminSidebar";
import StatusBadge from "../components/Admin/StatusBadge";
import StoreInspectionModal from "../components/Admin/StoreInspectionModal.jsx";

const TABS = ["pending", "approved", "denied"];

function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedStore, setSelectedStore] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const res = await fetch(
        "http://localhost:3000/api/restaurants/admin/",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setRestaurants(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load restaurants.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return restaurants.filter((r) => r.status === activeTab);
  }, [restaurants, activeTab]);

  const updateStatus = async (id, status) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      await fetch(
        `http://localhost:3000/api/restaurants/admin/${id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      setRestaurants((prev) =>
        prev.map((r) =>
          r.restaurant_id === id ? { ...r, status } : r
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      <AdminSidebar />

      <div className="flex-1 flex flex-col">

        <AdminNavbar pageTitle="Restaurants"/>

        <main className="p-6 overflow-auto space-y-6">

          {/* HEADER */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Restaurant Review Center
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage store applications and approvals
            </p>
          </div>

          {/* TABS */}
          <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm w-fit">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  activeTab === tab
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.toUpperCase()}
                <span className="ml-2 text-xs opacity-60">
                  ({restaurants.filter(r => r.status === tab).length})
                </span>
              </button>
            ))}
          </div>

          {/* LIST */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

            {loading ? (
              <div className="p-6 text-gray-500">
                Loading applications...
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                No applications in this status
              </div>
            ) : (
              <div className="divide-y divide-gray-100">

                {filtered.map((r) => (
                  <div
                    key={r.restaurant_id}
                    onClick={() => {
                      setSelectedStore(r);
                      setModalOpen(true);
                    }}
                    className={`flex items-center justify-between px-6 py-4 transition hover:bg-gray-50 cursor-pointer ${
                      r.status === "pending" ? "bg-yellow-50/40" : ""
                    }`}
                  >

                    {/* LEFT */}
                    <div className="flex items-center gap-4">
                      <img
                        src={r.profile_image || "https://via.placeholder.com/100"}
                        alt={r.name}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                      />

                      <div>
                        <p className="font-medium text-gray-900">
                          {r.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {r.user_profiles
                            ? `${r.user_profiles.first_name} ${r.user_profiles.last_name}`
                            : "Unknown Owner"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(r.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* STATUS */}
                    <div className="hidden md:block">
                      <StatusBadge status={r.status} />
                    </div>

                    {/* ACTIONS */}
                    <div className="flex gap-2">

                      {r.status === "pending" && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus(r.restaurant_id, "approved");
                            }}
                            className="px-4 py-2 text-sm rounded-xl bg-green-500 text-white hover:bg-green-600"
                          >
                            Approve
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus(r.restaurant_id, "denied");
                            }}
                            className="px-4 py-2 text-sm rounded-xl bg-red-500 text-white hover:bg-red-600"
                          >
                            Deny
                          </button>
                        </>
                      )}

                      {r.status === "approved" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(r.restaurant_id, "denied");
                          }}
                          className="px-4 py-2 text-sm rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          Revoke
                        </button>
                      )}

                      {r.status === "denied" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(r.restaurant_id, "approved");
                          }}
                          className="px-4 py-2 text-sm rounded-xl bg-green-100 text-green-700 hover:bg-green-200"
                        >
                          Approve
                        </button>
                      )}

                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>

        </main>
      </div>

      {/* MODAL */}
      <StoreInspectionModal
        open={modalOpen}
        store={selectedStore}
        onClose={() => setModalOpen(false)}
        onApprove={(id) => updateStatus(id, "approved")}
        onDeny={(id) => updateStatus(id, "denied")}
      />

    </div>
  );
}

export default AdminRestaurantsPage;