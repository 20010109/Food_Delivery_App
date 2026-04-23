import React, { useEffect, useState } from "react";
import { LuMapPin, LuPlus, LuTrash2, LuX } from "react-icons/lu";
import {
  getAddresses,
  createUserAddress,
  deleteUserAddress,
} from "../../utils/addressApi.js";

const LS_SELECTED_ADDRESS_KEY = "grubero_selected_address";

export default function SavedAddressModal({ open, onClose, onAddressChange }) {
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedAddress = localStorage.getItem(LS_SELECTED_ADDRESS_KEY) || "";

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAddresses();
      setAddresses(data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadAddresses();
    }
  }, [open]);

  const handleAddAddress = async () => {
    if (!newAddress.trim()) return;

    try {
      setSaving(true);
      setError("");
      await createUserAddress(newAddress.trim());
      setNewAddress("");
      await loadAddresses();
    } catch (err) {
      setError(err.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      setError("");
      await deleteUserAddress(addressId);
      await loadAddresses();
    } catch (err) {
      setError(err.message || "Failed to delete address");
    }
  };

  const handleSelectAddress = (addressLine) => {
    localStorage.setItem(LS_SELECTED_ADDRESS_KEY, addressLine);
    if (onAddressChange) onAddressChange(addressLine);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            <LuX className="text-2xl" />
          </button>
        </div>

        <div className="space-y-3 mb-5">
          <label className="block text-sm font-semibold text-gray-700">
            Add New Address
          </label>

          <div className="flex gap-3">
            <input
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Enter a new address"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
            />

            <button
              type="button"
              onClick={handleAddAddress}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 text-white px-4 py-3 font-semibold hover:bg-red-700 disabled:opacity-60"
            >
              <LuPlus />
              Add
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Your Saved Addresses
          </p>

          {loading ? (
            <div className="text-sm text-gray-500">Loading addresses...</div>
          ) : addresses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
              No saved addresses yet.
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr, index) => {
                const isSelected = selectedAddress === addr.address_line;

                return (
                  <div
                    key={addr.address_id}
                    className={`rounded-xl border p-4 flex items-center justify-between gap-4 ${
                      isSelected
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectAddress(addr.address_line)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <LuMapPin className="text-gray-500 shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {addr.address_line}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Address {index + 1}
                          </p>
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                          Selected
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.address_id)}
                        className="h-10 w-10 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center"
                      >
                        <LuTrash2 />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}