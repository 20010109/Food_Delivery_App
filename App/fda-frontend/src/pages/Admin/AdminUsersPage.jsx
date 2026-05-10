import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import AdminSidebar from "../components/Admin/AdminSidebar";
import AdminNavbar from "../components/Admin/AdminNavbar";

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search ,setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", {ascending: false});

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

      if (error) return alert ("Failed to update status");
      fetchUsers();
  };

  const filtered = users.filter((u) =>
  `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase())
);

  const roleColor = (role) => {
    const map = {
      admin: "bg-purple-100 text-purple-700 ring-1 ring-purple-100",
      storeowner: "bg-blue-100 text-blue-700 ring-1 ring-blue-100",
      rider: "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-100",
      customer: "bg-green-100 text-green-700 ring-1 ring-green-100",
    };
    return map[role] || "bg-gray-100 text-gray-600 ring-1 ring-gray-200";
  };

  const statusColor = (isActive) =>
    isActive ? "bg-green-50 text-green-700 ring-1 ring-green-100" : "bg-red-50 text-red-600 ring-1 ring-red-100";

  return (
    <div className="flex h-screen bg-[#f7f7fb]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar pageTitle="User Management" />

        <main className="p-6 overflow-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-400 mt-1">
                  Manage all registered users and their access levels
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 w-full sm:w-80">
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
                  />
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-w-[120px]">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Registered Users</h2>
                <p className="text-sm text-gray-400">
                  {filtered.length} user{filtered.length === 1 ? "" : "s"} shown
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80">
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
                      <tr key={u.user_id} className="hover:bg-red-50/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">
                            {u.first_name} {u.last_name}
                          </div>
                          <div className="text-xs text-gray-400">User ID: {u.user_id?.slice(0, 8)}</div>
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {u.contact_number || "No contact number"}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${roleColor(
                              u.role
                            )}`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColor(
                              u.is_active
                            )}`}
                          >
                            {u.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                            <select
                              value={u.role}
                              onChange={(e) => updateRoles(u.user_id, e.target.value)}
                              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                            >
                              <option value="customer">Customer</option>
                              <option value="storeowner">Storeowner</option>
                              <option value="rider">Rider</option>
                              <option value="admin">Admin</option>
                            </select>

                            <button
                              onClick={() => toggleActive(u.user_id, u.is_active)}
                              className={`h-10 rounded-xl px-4 text-xs font-semibold text-white transition ${
                                u.is_active
                                  ? "bg-red-500 hover:bg-red-600"
                                  : "bg-green-500 hover:bg-green-600"
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
                        <div className="mx-auto max-w-sm">
                          <p className="text-lg font-semibold text-gray-900">No users found</p>
                          <p className="mt-1 text-sm text-gray-400">
                            Try a different search term or clear the search box.
                          </p>
                        </div>
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