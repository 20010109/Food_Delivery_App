import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import { LuSearch } from "react-icons/lu";
import AdminSidebar from "../components/Admin/AdminSidebar";
import AdminNavbar from "../components/Admin/AdminNavbar";

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return console.error(error);
    setUsers(data);
  };

  const updateRoles = async (userId, role) => {
    const { error } = await supabase
      .from("user_profiles")
      .update({ role })
      .eq("user_id", userId);

    if (error) return alert("Failed to update role");
    fetchUsers();
  };

  const toggleActive = async (userId, current) => {
    const { error } = await supabase
      .from("user_profiles")
      .update({ is_active: !current })
      .eq("user_id", userId);

    if (error) return alert("Failed to update status");
    fetchUsers();
  };

  const ROLES = ["All", "customer", "storeowner", "rider", "admin"];

  const filtered = users.filter((u) => {
    const name = `${u.first_name} ${u.last_name}`.toLowerCase();
    const contact = (u.contact_number || "").toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase()) || contact.includes(search.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && u.is_active) ||
      (statusFilter === "Inactive" && !u.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const roleColor = (role) => {
    const map = {
      admin: "bg-purple-100 text-purple-700",
      storeowner: "bg-blue-100 text-blue-700",
      rider: "bg-yellow-100 text-yellow-700",
      customer: "bg-green-100 text-green-700",
    };
    return map[role] || "bg-gray-100 text-gray-600";
  };

  const statusColor = (isActive) =>
    isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600";

  const counts = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    inactive: users.filter((u) => !u.is_active).length,
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar pageTitle="User Management" />

        <main className="p-6 overflow-auto space-y-5">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-400 mt-1">Manage all registered users and their access levels</p>
            </div>

            {/* Stats */}
            <div className="flex gap-3">
              {[
                { label: "Total", value: counts.total, color: "text-gray-800" },
                { label: "Active", value: counts.active, color: "text-green-600" },
                { label: "Inactive", value: counts.inactive, color: "text-red-500" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white rounded-2xl shadow-sm px-4 py-3 text-center min-w-[72px]">
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Search by name or contact..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>

            {/* Status filter */}
            <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 text-xs self-start">
              {["All", "Active", "Inactive"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    statusFilter === s ? "bg-red-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Role tabs */}
          <div className="flex gap-2 flex-wrap">
            {ROLES.map((role) => {
              const count = role === "All" ? users.length : users.filter((u) => u.role === role).length;
              return (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition border ${
                    roleFilter === role
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {role} <span className="ml-1 opacity-60">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-800">{filtered.length}</span> user{filtered.length !== 1 ? "s" : ""}
                {roleFilter !== "All" && <span> &middot; Role: <span className="font-semibold capitalize">{roleFilter}</span></span>}
                {statusFilter !== "All" && <span> &middot; Status: <span className="font-semibold">{statusFilter}</span></span>}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-gray-400 uppercase tracking-wide text-[11px]">
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Contact</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filtered.length > 0 ? (
                    filtered.map((u) => (
                      <tr key={u.user_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{u.first_name} {u.last_name}</div>
                          <div className="text-xs text-gray-400">ID: {u.user_id?.slice(0, 8)}</div>
                        </td>

                        <td className="px-6 py-4 text-gray-600">{u.contact_number || "—"}</td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center justify-center w-24 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${roleColor(u.role)}`}>
                            {u.role}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center justify-center w-20 rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor(u.is_active)}`}>
                            {u.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                            <select
                              value={u.role}
                              onChange={(e) => updateRoles(u.user_id, e.target.value)}
                              className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                            >
                              <option value="customer">Customer</option>
                              <option value="storeowner">Storeowner</option>
                              <option value="rider">Rider</option>
                              <option value="admin">Admin</option>
                            </select>

                            <button
                              onClick={() => toggleActive(u.user_id, u.is_active)}
                              className={`h-9 w-28 rounded-xl text-xs font-semibold text-white transition ${
                                u.is_active ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                              }`}
                            >
                              {u.is_active ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-16 text-center">
                        <p className="text-base font-semibold text-gray-700">No users found</p>
                        <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default AdminUsersPage;