import React, { useEffect, useState } from "react";
import { LuX, LuArrowRight, LuMapPin } from "react-icons/lu";
import { getPrimaryAddress } from "../../utils/addressApi.js";

export default function AddressModal({
  open,
  onClose,
  onOpenSavedAddresses, // NEW
  refreshKey, // optional: force refresh when default changes
}) {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(null);

  const loadAddress = async () => {
    try {
      setLoading(true);
      const current = await getPrimaryAddress();
      setAddress(current || null);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadAddress();
  }, [open, refreshKey]);

  if (!open) return null;

  const formatAddress = (a) => {
    if (!a) return "No address set";
    return `${a.house_no || ""} ${a.street || ""}, Brgy. ${
      a.barangay || ""
    }, ${a.city || ""}, ${a.province || ""}, ${a.postal_code || ""}`;
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            Delivery Address
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 transition"
          >
            <LuX className="text-xl text-gray-600" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-5 space-y-4">
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-white">
              <LuMapPin className="text-gray-500 mt-1" />

              <div className="text-sm text-gray-700">
                {formatAddress(address)}
              </div>
            </div>
          )}

          {/* BUTTON */}
          <button
            onClick={onOpenSavedAddresses}
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-xl font-medium hover:bg-red-700 transition"
          >
            <LuArrowRight />
            Change / Add Address
          </button>
        </div>
      </div>
    </div>
  );
}