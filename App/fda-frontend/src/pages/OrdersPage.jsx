export default function OrdersPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">My Orders</h1>

      <p className="text-gray-500 mt-2">
        This page will show:
      </p>

      <ul className="list-disc ml-6 mt-2 text-gray-600">
        <li>Past orders</li>
        <li>Ongoing orders</li>
        <li>Cancelled orders</li>
        <li>Order details (items, store, time)</li>
      </ul>
    </div>
  );
}