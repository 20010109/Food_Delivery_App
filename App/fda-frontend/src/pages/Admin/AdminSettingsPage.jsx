import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase.js";
import AdminSidebar from "../components/Admin/AdminSidebar.jsx";
import AdminNavbar from "../components/Admin/AdminNavbar.jsx";
import {
  LuUser,
  LuLock,
  LuShield,
  LuLogOut,
  LuChevronRight,
} from "react-icons/lu";

function AdminSettingsPage() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("Admin");
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState("");

  /* ---------- Password change state ---------- */
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return;

      setUserId(authData.user.id);
      setEmail(authData.user.email || "");

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("first_name, last_name")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (profile?.first_name) {
        setAdminName(`${profile.first_name} ${profile.last_name || ""}`.trim());
      }
    };

    fetchProfile();
  }, []);

  /* ---------- Handlers ---------- */
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);
    setPasswordError(null);

    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordForm.newPass.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.newPass,
    });
    setPasswordLoading(false);

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordMsg("Password updated successfully.");
      setPasswordForm({ current: "", newPass: "", confirm: "" });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  /* ---------- UI ---------- */
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar adminName={adminName} pageTitle="Settings" userId={userId} />

        <main className="p-6 overflow-auto flex flex-col gap-8 pb-12">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Admin Settings</h1>
            <p className="text-sm text-gray-400 mt-1">Manage your account and platform preferences</p>
          </div>

          {/* ── Account Info ── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <LuUser size={18} className="text-red-600" />
              <h2 className="text-base font-semibold text-gray-800">Account Info</h2>
            </div>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-3">
                <p className="text-xs text-gray-400 mb-1">Display Name</p>
                <p className="text-sm font-medium text-gray-800">{adminName}</p>
              </div>
              <div className="border-b border-gray-200 pb-3">
                <p className="text-xs text-gray-400 mb-1">Email Address</p>
                <p className="text-sm font-medium text-gray-800">{email || "—"}</p>
              </div>
              <div className="border-b border-gray-200 pb-3">
                <p className="text-xs text-gray-400 mb-1">Role</p>
                <span className="inline-block text-xs font-semibold bg-red-100 text-red-600 px-3 py-1 rounded-full">
                  System Administrator
                </span>
              </div>
              <button
                onClick={() => navigate("/admin/profile")}
                className="flex items-center gap-1 text-sm text-red-600 hover:underline"
              >
                Edit Profile <LuChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* ── Change Password ── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <LuLock size={18} className="text-red-600" />
              <h2 className="text-base font-semibold text-gray-800">Change Password</h2>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
              <div>
                <label className="text-xs text-gray-400 block mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPass}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPass: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-200 bg-white"
                  placeholder="Min. 8 characters"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-200 bg-white"
                  placeholder="Repeat new password"
                  required
                />
              </div>
              {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
              {passwordMsg && <p className="text-xs text-green-600">{passwordMsg}</p>}
              <button
                type="submit"
                disabled={passwordLoading}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-6 py-2 rounded-xl transition disabled:opacity-60"
              >
                {passwordLoading ? "Updating…" : "Update Password"}
              </button>
            </form>
          </div>

          {/* ── Security ── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <LuShield size={18} className="text-red-600" />
              <h2 className="text-base font-semibold text-gray-800">Security</h2>
            </div>
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 max-w-sm">
              <div>
                <p className="text-sm font-medium text-gray-700">Active Session</p>
                <p className="text-xs text-gray-400">Logged in as {email}</p>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Active</span>
            </div>
          </div>

          {/* ── Sign Out ── */}
          <div className="mt-auto pt-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition font-medium"
            >
              <LuLogOut size={16} /> Sign Out
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}

export default AdminSettingsPage;
