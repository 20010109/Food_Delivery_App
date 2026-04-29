import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";

function AdminUsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*");

    if (error) {
      console.error(error);
      return;
    }

    setUsers(data);
  };

  const updateRole = async (userId, role) => {
    const { error } = await supabase
      .from("user_profiles")
      .update({ role })
      .eq("user_id", userId);

    if (error) {
      console.error(error);
      alert("Failed to update role");
      return;
    }

    fetchUsers();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      <table className="w-full bg-white rounded shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Role</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.user_id} className="border-t">
              <td className="p-3">
                {u.first_name} {u.last_name}
              </td>

              <td className="p-3">{u.role}</td>

              <td className="p-3 space-x-2">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => updateRole(u.user_id, "storeowner")}
                >
                  Make Storeowner
                </button>

                <button
                  className="bg-gray-500 text-white px-2 py-1 rounded"
                  onClick={() => updateRole(u.user_id, "customer")}
                >
                  Make Customer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsersPage;