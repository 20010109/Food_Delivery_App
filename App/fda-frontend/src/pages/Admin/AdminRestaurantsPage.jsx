import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";

import AdminNavbar from "../components/Admin/AdminNavbar";
import AdminSidebar from "../components/Admin/AdminSidebar";
import StatusBadge from "../components/Admin/StatusBadge";

function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  /* GET ALL RESTAURANTS FROM BACKEND */
  const fetchRestaurants = async () => {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;

      const res = await fetch(
        "http://localhost:3000/api/restaurants/admin/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
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

  /* UPDATE STATUS */
  const updateStatus = async (restaurantId, status) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;

      const res = await fetch(
        `http://localhost:3000/api/restaurants/admin/${restaurantId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      fetchRestaurants();
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminNavbar />

        <main className="p-6 overflow-auto">

          <h1 className="text-2xl font-bold mb-6">
            Restaurant Management
          </h1>

          <div className="bg-white rounded-xl shadow overflow-hidden">

            {loading ? (
              <div className="p-6 text-gray-500">
                Loading restaurants...
              </div>
            ) : (
              <table className="w-full text-left text-sm">

                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4">Restaurant</th>
                    <th>Owner</th>
                    <th>Date Applied</th>
                    <th>Status</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {restaurants.map((r) => (
                    <tr
                      key={r.restaurant_id}
                      className="border-t"
                    >
                      <td className="p-4 font-medium">
                        {r.name}
                      </td>

                      <td>
                        {r.user_profiles?.first_name}{" "}
                        {r.user_profiles?.last_name}
                      </td>

                      <td>
                        {new Date(
                          r.created_at
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        <StatusBadge status={r.status} />
                      </td>

                      <td className="p-4 text-right space-x-2">

                        {r.status !== "approved" && (
                          <button
                            onClick={() =>
                              updateStatus(
                                r.restaurant_id,
                                "approved"
                              )
                            }
                            className="bg-green-500 text-white px-3 py-1 rounded"
                          >
                            Approve
                          </button>
                        )}

                        {r.status !== "denied" && (
                          <button
                            onClick={() =>
                              updateStatus(
                                r.restaurant_id,
                                "denied"
                              )
                            }
                            className="bg-red-500 text-white px-3 py-1 rounded"
                          >
                            Deny
                          </button>
                        )}

                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            )}

          </div>

        </main>
      </div>
    </div>
  );
}

export default AdminRestaurantsPage;