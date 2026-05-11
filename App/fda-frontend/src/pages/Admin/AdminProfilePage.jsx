import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuMail,
  LuPhone,
  LuPencil,
  LuLogOut,
  LuUser,
  LuShield,
} from "react-icons/lu";
import { supabase } from "../../utils/supabase.js";
import AdminSidebar from "../components/Admin/AdminSidebar.jsx";
import AdminNavbar from "../components/Admin/AdminNavbar.jsx";
import EditProfileModal from "../EditProfileModal.jsx";
import DefaultProfile from "../../assets/Stock_User.jpg";

function AdminProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [adminName, setAdminName] = useState("Admin");

  const fetchProfile = async () => {
    const { data: authData, error } = await supabase.auth.getUser();
    if (error || !authData?.user) {
      navigate("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    const merged = { ...authData.user, ...(profile || {}) };
    setUser(merged);

    if (profile?.first_name) {
      setAdminName(`${profile.first_name} ${profile.last_name || ""}`.trim());
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleEditSave = () => {
    setEditOpen(false);
    fetchProfile();
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          Loading profile…
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar adminName={adminName} pageTitle="My Profile" />

        <main className="p-6 overflow-auto">

          {/* Profile card */}
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden max-w-4xl mx-auto">

            {/* Banner */}
            <div className="bg-gray-900 px-8 py-8 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                <div className="flex items-center gap-5">
                  <img
                    src={user?.profile_image || DefaultProfile}
                    alt="Admin"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
                  />

                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-red-300 mb-2">
                      Admin Profile
                    </p>
                    <h1 className="text-3xl font-bold leading-tight">
                      {user?.first_name || "Admin"} {user?.last_name || ""}
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-300">
                      <span className="inline-flex items-center gap-2">
                        <LuMail className="text-red-400" />
                        {user?.email}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-red-600/15 border border-red-500/20 px-3 py-1 text-xs font-semibold text-red-300">
                        System Administrator
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setEditOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-gray-900 px-5 py-3 font-semibold hover:bg-gray-100 transition"
                  >
                    <LuPencil size={16} /> Edit Profile
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 text-white px-5 py-3 font-semibold hover:bg-red-700 transition"
                  >
                    <LuLogOut size={16} /> Sign Out
                  </button>
                </div>

              </div>
            </div>

            {/* Body */}
            <div className="p-8 grid grid-cols-1 xl:grid-cols-2 gap-6">

              {/* Personal Info */}
              <section className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <LuUser className="text-red-500" />
                  <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500 mb-1">First Name</p>
                    <p className="font-semibold text-gray-900">{user?.first_name || "Not set"}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500 mb-1">Last Name</p>
                    <p className="font-semibold text-gray-900">{user?.last_name || "Not set"}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:col-span-2">
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <LuPhone className="text-red-500" /> Contact Number
                    </p>
                    <p className="font-semibold text-gray-900">{user?.contact_number || "Not set"}</p>
                  </div>
                </div>
              </section>

              {/* Account Details */}
              <section className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <LuShield className="text-red-500" />
                  <h2 className="text-lg font-bold text-gray-900">Account Details</h2>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <LuMail className="text-red-500" /> Email Address
                    </p>
                    <p className="font-semibold text-gray-900">{user?.email}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500 mb-1">Role</p>
                    <span className="inline-flex items-center rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-semibold text-red-600">
                      System Administrator
                    </span>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500 mb-1">Account Status</p>
                    <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-700">
                      Active
                    </span>
                  </div>
                </div>
              </section>

            </div>
          </div>

        </main>
      </div>

      {editOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setEditOpen(false)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}

export default AdminProfilePage;
