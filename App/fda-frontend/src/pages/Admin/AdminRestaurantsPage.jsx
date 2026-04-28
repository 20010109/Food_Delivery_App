import AdminNavbar from "../components/Admin/AdminNavbar";
import AdminSidebar from "../components/Admin/AdminSidebar";
import StatusBadge from "../components/Admin/StatusBadge";

function AdminRestaurantsPage() {

  const restaurants = [
    { id: 1, name: "Jollibee Sample", owner: "Juan", status: "pending" },
    { id: 2, name: "McDo Sample", owner: "Maria", status: "approved" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">

      <AdminSidebar />

      <div className="flex-1 flex flex-col">

        <AdminNavbar />

        <main className="p-6 overflow-auto">

          <h1 className="text-2xl font-bold mb-4">
            Restaurants
          </h1>

          <div className="bg-white rounded shadow overflow-hidden">

            <table className="w-full text-left">

              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3">Name</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>

              <tbody>

                {restaurants.map((r) => (
                  <tr key={r.id} className="border-t">

                    <td className="p-3">{r.name}</td>

                    <td>{r.owner}</td>

                    <td>
                      <StatusBadge status={r.status} />
                    </td>

                    <td className="p-3 text-right space-x-2">

                      <button className="bg-green-500 text-white px-3 py-1 rounded text-sm">
                        Approve
                      </button>

                      <button className="bg-red-500 text-white px-3 py-1 rounded text-sm">
                        Deny
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

export default AdminRestaurantsPage;