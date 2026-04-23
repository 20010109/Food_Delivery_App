import React, { useEffect, useState } from "react";
import { LuX, LuArrowRight, LuMapPin } from "react-icons/lu";
import { getPrimaryAddress, createUserAddress } from "../../utils/addressApi.js";

export default function AddressModal({
  open,
  address,
  setAddress,
  onClose,
  onSave,
}) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedAddress, setSavedAddress] = useState(null);

  useEffect(() => {
    if (!open) return;

    const loadAddress = async () => {
      try {
        setInitialLoading(true);
        setError("");

        const current = await getPrimaryAddress();
        setSavedAddress(current || null);
        setAddress(current?.address_line || "");
      } catch (err) {
        setError(err.message || "Failed to load address");
      } finally {
        setInitialLoading(false);
      }
    };

    loadAddress();
  }, [open, setAddress]);

  const handleSave = async () => {
    const trimmed = address.trim();

    if (!trimmed) {
      setError("Address is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const saved = await createUserAddress(trimmed);
      setSavedAddress(saved);

      if (onSave) {
        onSave(saved?.address_line || trimmed);
      }

      onClose();
    } catch (err) {
      setError(err.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

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
        {initialLoading ? (
          <div className="py-8 text-center text-gray-500">Loading address...</div>
        ) : (
          <>
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
                className="h-12 w-12 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center justify-center disabled:opacity-60"
                onClick={handleSave}
                title="Save"
                disabled={loading}
              >
                <LuArrowRight />
              </button>
            </div>

            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Saved Address
              </p>

              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <button
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 text-left"
                  onClick={() => {
                    if (savedAddress?.address_line) {
                      setAddress(savedAddress.address_line);
                    }
                  }}
                >
                  <span className="flex items-center gap-2 text-gray-700">
                    <LuMapPin className="text-gray-500" />
                    {savedAddress?.address_line || "No saved address yet"}
                  </span>

                  {savedAddress?.address_line && (
                    <span className="text-green-600 font-bold">✓</span>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}