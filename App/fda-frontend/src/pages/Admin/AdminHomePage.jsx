import AdminNavbar from "../components/Admin/AdminNavbar";
import AdminSidebar from "../components/Admin/AdminSidebar";
import StatCard from "../components/Admin/StatCard";

function AdminHomePage() {
  return (
    <div className="flex h-screen bg-gray-100">

      <AdminSidebar />

      <div className="flex-1 flex flex-col">

        <AdminNavbar />

        <main className="p-6 overflow-auto">

          <h1 className="text-2xl font-bold mb-6">
            Admin Dashboard
          </h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Users" value="1,240" />
            <StatCard title="Restaurants" value="87" />
            <StatCard title="Orders" value="3,540" />
            <StatCard title="Revenue" value="₱620,000" />
          </div>

          {/* Quick pending section */}
          <div className="mt-8 bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-3">
              Pending Restaurant Approvals
            </h2>

            <p className="text-gray-500 text-sm">
              Go to Restaurants tab to manage approvals
            </p>
          </div>

        </main>
      </div>
    </div>
  );
}

export default AdminHomePage;