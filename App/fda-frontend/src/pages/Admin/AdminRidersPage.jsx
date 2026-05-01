import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";

import NoProfile from "../../assets/Stock_User.jpg"
import AdminNavbar from "../components/Admin/AdminNavbar";
import AdminSidebar from "../components/Admin/AdminSidebar";

function AdminRidersPage() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRider, setSelectedRider] = useState(null);

  // =========================
  // FETCH RIDERS
  // =========================
  const fetchRiders = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("rider_profiles")
      .select(`
        id,
        user_id,
        vehicle_type,
        vehicle_plate_number,
        license_number,
        or_code,
        cr_code,
        verification_status,
        availability_status,
        created_at,
        user:user_profiles (
          first_name,
          last_name,
          contact_number,
          profile_image
        )
      `)
      .order("created_at", { ascending: false });

    if (!error) setRiders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  // =========================
  // UPDATE STATUS
  // =========================
  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from("rider_profiles")
      .update({ verification_status: status })
      .eq("id", id);

    if (error) return alert(error.message);

    setSelectedRider(null);
    fetchRiders();
  };

  // =========================
  // MODAL
  // =========================
  const RiderModal = ({ rider, onClose }) => {
    if (!rider) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Rider Application</h2>
            <button onClick={onClose} className="text-gray-500 text-xl">×</button>
          </div>

          {/* USER INFO */}
          <div className="flex items-center gap-3 mb-5">
            <img
              src={rider.user?.profile_image || NoProfile}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">
                {rider.user?.first_name} {rider.user?.last_name}
              </p>
              <p className="text-sm text-gray-500">
                {rider.user?.contact_number}
              </p>
            </div>
          </div>

          {/* DETAILS */}
          <div className="space-y-2 text-sm">
            <p><b>Vehicle:</b> {rider.vehicle_type}</p>
            <p><b>Plate:</b> {rider.vehicle_plate_number || "N/A"}</p>
            <p><b>License:</b> {rider.license_number || "N/A"}</p>
            <p><b>OR Code:</b> {rider.or_code || "N/A"}</p>
            <p><b>CR Code:</b> {rider.cr_code || "N/A"}</p>

            <p className="pt-2">
              <b>Status:</b>{" "}
              <span className="capitalize">
                {rider.verification_status}
              </span>
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => updateStatus(rider.id, "approved")}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg"
            >
              Approve
            </button>

            <button
              onClick={() => updateStatus(rider.id, "rejected")}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    );
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar pageTitle="Rider Management" />

        <div className="p-6 overflow-y-auto">

          <h1 className="text-2xl font-bold mb-4">Riders</h1>

          {loading ? (
            <p className="text-gray-500">Loading riders...</p>
          ) : (
            <div className="grid gap-3">

              {riders.map((rider) => (
                <div
                  key={rider.id}
                  onClick={() => setSelectedRider(rider)}
                  className="bg-white border rounded-xl p-4 flex justify-between items-center cursor-pointer hover:shadow-md transition"
                >

                  {/* LEFT */}
                  <div className="flex items-center gap-3">
                    <img
                      src={rider.user?.profile_image || NoProfile}
                      className="w-10 h-10 rounded-full object-cover"
                    />

                    <div>
                      <h2 className="font-semibold">
                        {rider.user?.first_name} {rider.user?.last_name}
                      </h2>

                      <p className="text-xs text-gray-500">
                        {rider.vehicle_type} • {rider.vehicle_plate_number || "No plate"}
                      </p>
                    </div>
                  </div>

                  {/* STATUS BADGE */}
                  <span
                    className={`text-xs px-3 py-1 rounded-full capitalize
                      ${
                        rider.verification_status === "approved"
                          ? "bg-green-100 text-green-700"
                          : rider.verification_status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }
                    `}
                  >
                    {rider.verification_status}
                  </span>

                </div>
              ))}

            </div>
          )}

          {/* MODAL */}
          <RiderModal
            rider={selectedRider}
            onClose={() => setSelectedRider(null)}
          />

        </div>
      </div>
    </div>
  );
}

export default AdminRidersPage;