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
      admin: "bg-purple-100 text-purple-700",
      storeowner: "bg-blue-100 text-blue-700",
      rider: "bg-yellow-100 text-yellow-700",
      customer: "bg-green-100 text-green-700",
    };
    return map[role] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar pageTitle="User Management"/>

        <main className="p-6 overflow-auto">
          <h1 className="text-2xl font-bold mb-1">User Management</h1>
          <p className="text-gray-500 text-sm mb-6">Manage all registered users</p>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-72 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-400 text-left">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.user_id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-4 font-medium">
                      {u.first_name} {u.last_name}
                    </td>
                    <td className="p-4 text-gray-500">{u.contact_number}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${roleColor(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.is_active ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 space-x-2">
                      <select
                        value={u.role}
                        onChange={(e) => updateRole(u.user_id, e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none"
                      >
                        <option value="customer">Customer</option>
                        <option value="storeowner">Storeowner</option>
                        <option value="rider">Rider</option>
                        <option value="admin">Admin</option>
                      </select>

                      <button
                        onClick={() => toggleActive(u.user_id, u.is_active)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold text-white ${u.is_active ? "bg-red-400 hover:bg-red-500" : "bg-green-400 hover:bg-green-500"}`}
                      >
                        {u.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminUsersPage;