import React, { useEffect, useState } from "react";
import { LuMapPin, LuX } from "react-icons/lu";
import { getPrimaryAddress, savePrimaryAddress } from "../../utils/addressApi.js";

export default function SavedAddressModal({ open, onClose, onSaved }) {
  const [address, setAddress] = useState("");
  const [savedAddress, setSavedAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState("");

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

  useEffect(() => {
    if (open) {
      loadAddress();
    }
  }, [open]);

  const handleSave = async () => {
    if (!address.trim()) {
      setError("Address is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const saved = await savePrimaryAddress(address.trim());
      setSavedAddress(saved);

      if (onSaved) {
        onSaved(saved);
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
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">Saved Addresses</h3>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <LuX className="text-xl" />
          </button>
        </div>

        {initialLoading ? (
          <p className="text-sm text-gray-500">Loading address...</p>
        ) : (
          <>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Current Address
              </label>

              <div className="relative">
                <LuMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your address"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                />
              </div>

              {savedAddress?.address_line && (
                <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-1">Saved now</p>
                  <p className="text-sm font-medium text-gray-700">
                    {savedAddress.address_line}
                  </p>
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-500 mt-3">{error}</p>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="w-full mt-5 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}