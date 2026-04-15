import { useEffect, useState } from "react";

export default function AddToCartModal({ open, item, onClose, onConfirm }) {
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [unavailableAction, setUnavailableAction] = useState("remove");

  useEffect(() => {
    if (open) {
      setQty(1);
      setNotes("");
      setUnavailableAction("remove");
    }
  }, [open, item?.item_id]);

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* dark overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* modal */}
      <div className="absolute left-1/2 top-1/2 w-[min(560px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="font-bold text-lg truncate">{item.name}</div>
            <div className="text-sm text-gray-500 truncate">{item.description}</div>
          </div>

          <button
            className="h-9 w-9 rounded-lg border border-gray-200 hover:bg-gray-50"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Price</div>
            <div className="font-semibold">₱{item.price}</div>
          </div>

          <div>
            <div className="font-semibold mb-2">Special instructions</div>
            <textarea
              className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              placeholder="e.g. No mayo"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <div className="font-semibold mb-2">If this product is not available</div>
            <select
              className="w-full rounded-xl border border-gray-200 p-3 text-sm bg-white"
              value={unavailableAction}
              onChange={(e) => setUnavailableAction(e.target.value)}
            >
              <option value="remove">Remove it from my order</option>
              <option value="contact">Contact me</option>
              <option value="replace">Replace with similar item</option>
            </select>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              className="h-10 w-10 rounded-full border border-gray-200 hover:bg-gray-50"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <div className="w-10 text-center font-semibold">{qty}</div>
            <button
              className="h-10 w-10 rounded-full border border-gray-200 hover:bg-gray-50"
              onClick={() => setQty((q) => q + 1)}
            >
              +
            </button>
          </div>

          <button
            className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition"
            onClick={() => onConfirm({ qty, notes, unavailableAction })}
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}