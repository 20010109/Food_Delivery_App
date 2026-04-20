import React from "react";
import { LuX, LuArrowRight, LuMapPin } from "react-icons/lu";

export default function AddressModal({
  open,
  address,
  setAddress,
  onClose,
  onSave,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-24"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-white px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              placeholder="Enter your address"
            />

            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setAddress("")}
              title="Clear"
            >
              <LuX />
            </button>
          </div>

          <button
            type="button"
            className="h-12 w-12 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center justify-center"
            onClick={onSave}
            title="Save"
          >
            <LuArrowRight />
          </button>
        </div>

        {/* Saved addresses (dummy for now) */}
        <div className="mt-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Saved Addresses
          </p>

          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <button
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 text-left"
              onClick={() => {
                setAddress("Cebu, 6000");
                onSave();
              }}
            >
              <span className="flex items-center gap-2 text-gray-700">
                <LuMapPin className="text-gray-500" />
                Cebu, 6000
              </span>
              <span className="text-green-600 font-bold">✓</span>
            </button>
          </div>
        </div>

        {/* BACKEND NOTE */}
        {/* TODO (backend/settings): load saved addresses for this user from DB */}
      </div>
    </div>
  );
}