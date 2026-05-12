import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import { LuUsers, LuClock, LuCircleCheck, LuCircleX, LuSearch, LuBike } from "react-icons/lu";

import NoProfile from "../../assets/Stock_User.jpg"
import AdminNavbar from "../components/Admin/AdminNavbar";
import AdminSidebar from "../components/Admin/AdminSidebar";

function AdminRidersPage() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRider, setSelectedRider] = useState(null);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState("All");

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
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      
      const res = await fetch("http://localhost:3000/api/rider/verify", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rider_id: id,
          status: status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      setSelectedRider(null);
      fetchRiders();
    } catch (err) {
      alert(err.message);
    }
  };

  // =========================
  // DELETE RIDER
  // =========================
  const deleteRider = async (id) => {
    if (!window.confirm("Remove this rider's application? They will be able to reapply.")) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const res = await fetch(`http://localhost:3000/api/rider/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete rider");
      }

      setSelectedRider(null);
      fetchRiders();
    } catch (err) {
      alert(err.message);
    }
  };

    const getVerificationStatusClass = (status) => {
    if (status === "approved") return "bg-green-100 text-green-700";
    if (["denied", "rejected"].includes(status)) return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const getAvailabilityClass = (status) => {
    if (status === "available") return "bg-emerald-100 text-emerald-700";
    if (status === "on_delivery") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-500";
  };

  const counts = {
    All: riders.length,
    Pending: riders.filter((r) => r.verification_status === "pending").length,
    Approved: riders.filter((r) => r.verification_status === "approved").length,
    Denied: riders.filter((r) => ["denied", "rejected"].includes(r.verification_status)).length,
  };

  const filteredRiders = riders.filter((r) => {
    const name = `${r.user?.first_name} ${r.user?.last_name}`.toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase()) ||
      (r.vehicle_plate_number || "").toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      filterTab === "All" ||
      (filterTab === "Pending" && r.verification_status === "pending") ||
      (filterTab === "Approved" && r.verification_status === "approved") ||
      (filterTab === "Denied" && ["denied", "rejected"].includes(r.verification_status));
    return matchesSearch && matchesTab;
  });

  // =========================
  // MODAL
  // =========================

  const RiderModal = ({ rider, onClose }) => {
    if (!rider) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">

          {/* HEADER BANNER */}
          <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-5 flex justify-between items-start">
            <div className="flex items-center gap-4">
              <img
                src={rider.user?.profile_image || NoProfile}
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
              />
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">
                  {rider.user?.first_name} {rider.user?.last_name}
                </h2>
                <p className="text-red-100 text-sm">{rider.user?.contact_number}</p>
                <span className={`inline-flex mt-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${getVerificationStatusClass(rider.verification_status)}`}>
                  {rider.verification_status}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">&times;</button>
          </div>

          <div className="p-6 space-y-5">
            {/* VEHICLE INFO */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Vehicle Info</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Vehicle Type", value: rider.vehicle_type },
                  { label: "Plate Number", value: rider.vehicle_plate_number || "N/A" },
                  { label: "License No.", value: rider.license_number || "N/A" },
                  { label: "Availability", value: rider.availability_status || "N/A" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="font-semibold text-gray-800 text-sm capitalize mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* DOCUMENT CODES */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Document Codes</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "OR Code", value: rider.or_code || "N/A" },
                  { label: "CR Code", value: rider.cr_code || "N/A" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="font-semibold text-gray-800 text-sm mt-0.5 break-all">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 pt-1">
              {rider.verification_status === "pending" && (
                <>
                  <button
                    onClick={() => updateStatus(rider.id, "approved")}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-medium transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => deleteRider(rider.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-medium transition"
                  >
                    Deny
                  </button>
                </>
              )}
              {rider.verification_status === "approved" && (
                <button
                  onClick={() => deleteRider(rider.id)}
                  className="flex-1 bg-gray-700 hover:bg-gray-800 text-white py-2.5 rounded-xl font-medium transition"
                >
                  Remove Rider
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar pageTitle="Rider Management" />

        <main className="p-6 overflow-y-auto space-y-5">

          {/* HEADER */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Rider Management</h1>
            <p className="text-sm text-gray-500 mt-1">Review and manage rider applications</p>
          </div>

          {/* STAT CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Riders", value: counts.All, icon: <LuUsers size={18} />, color: "text-indigo-500", bg: "bg-indigo-50" },
              { label: "Pending", value: counts.Pending, icon: <LuClock size={18} />, color: "text-yellow-600", bg: "bg-yellow-50" },
              { label: "Approved", value: counts.Approved, icon: <LuCircleCheck size={18} />, color: "text-green-600", bg: "bg-green-50" },
              { label: "Denied", value: counts.Denied, icon: <LuCircleX size={18} />, color: "text-red-500", bg: "bg-red-50" },
            ].map(({ label, value, icon, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} ${color}`}>{icon}</div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* SEARCH + FILTER */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by name or plate number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>
            <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 text-xs self-start">
              {["All", "Pending", "Approved", "Denied"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    filterTab === tab ? "bg-red-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab} <span className="ml-1 opacity-70">({counts[tab]})</span>
                </button>
              ))}
            </div>
          </div>

          {/* RIDER LIST */}
          {loading ? (
            <div className="grid gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-2 bg-gray-100 rounded w-1/2" />
                  </div>
                  <div className="h-6 w-20 bg-gray-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : filteredRiders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 flex flex-col items-center text-center">
              <LuBike size={40} className="text-gray-300 mb-3" />
              <p className="font-semibold text-gray-600">No riders found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredRiders.map((rider) => (
                <div
                  key={rider.id}
                  onClick={() => setSelectedRider(rider)}
                  className="bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 cursor-pointer hover:shadow-md hover:scale-[1.005] transition-all"
                >
                  <img
                    src={rider.user?.profile_image || NoProfile}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-gray-900 truncate">
                      {rider.user?.first_name} {rider.user?.last_name}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {rider.vehicle_type} &nbsp;•&nbsp; {rider.vehicle_plate_number || "No plate"} &nbsp;•&nbsp; {rider.user?.contact_number}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${getVerificationStatusClass(rider.verification_status)}`}>
                      {rider.verification_status}
                    </span>
                    {rider.verification_status === "approved" && (
                      <span className={`text-xs px-2.5 py-0.5 rounded-full capitalize ${getAvailabilityClass(rider.availability_status)}`}>
                        {rider.availability_status?.replace("_", " ") || "offline"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>

      <RiderModal rider={selectedRider} onClose={() => setSelectedRider(null)} />
    </div>
  );
}

export default AdminRidersPage;