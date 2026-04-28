import { NavLink } from "react-router-dom";

function AdminSidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white p-4">

      <h2 className="text-xl font-bold mb-6">
        Admin Panel
      </h2>

      <nav className="space-y-2 text-sm">

        <NavLink to="/admin" className="block p-2 rounded hover:bg-gray-800">
          Dashboard
        </NavLink>

        <NavLink to="/admin/restaurants" className="block p-2 rounded hover:bg-gray-800">
          Restaurants
        </NavLink>

        <NavLink to="/admin/users" className="block p-2 rounded hover:bg-gray-800">
          Users
        </NavLink>

        <NavLink to="/admin/orders" className="block p-2 rounded hover:bg-gray-800">
          Orders
        </NavLink>

      </nav>

    </aside>
  );
}

export default AdminSidebar;