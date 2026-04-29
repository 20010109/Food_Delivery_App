import React, { useEffect, useState } from "react";
import { LuMapPin, LuPlus, LuTrash2, LuX, LuCheck } from "react-icons/lu";
import {
  getAddresses,
  createUserAddress,
  deleteUserAddress,
  setDefaultAddress,
} from "../../utils/addressApi.js";

export default function SavedAddressModal({ open, onClose, onAddressChange }) {
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    house_no: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
    postal_code: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    if (open) loadAddresses();
  }, [open]);

  const formatAddress = (a) =>
    `${a.house_no || ""} ${a.street || ""}, Brgy. ${a.barangay || ""}, ${
      a.city || ""
    }, ${a.province || ""}, ${a.postal_code || ""}`;

  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city) {
      setError("Street and City are required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await createUserAddress(newAddress);

      setNewAddress({
        house_no: "",
        street: "",
        barangay: "",
        city: "",
        province: "",
        postal_code: "",
      });

      await loadAddresses();
    } catch (err) {
      setError(err.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await deleteUserAddress(id);
      await loadAddresses();
    } catch (err) {
      setError(err.message || "Failed to delete address");
    }
  };

  const handleSelectAddress = async (address) => {
    // keep snapshot for rollback
    const previous = [...addresses];
  
    try {
      // 1. Optimistic UI update (instant highlight)
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          is_default: a.address_id === address.address_id,
        }))
      );
  
      // 2. backend update
      await setDefaultAddress(address.address_id);
  
      // 3. notify parent safely
      onAddressChange?.({
        ...address,
        formatted: formatAddress(address),
      });
  
      // 4. close modal AFTER state settles (prevents flicker/bug)
      setTimeout(() => {
        onClose();
      }, 50);
    } catch (err) {
      // rollback if backend fails
      setAddresses(previous);
  
      setError(err.message || "Failed to set default address");
  
      // resync with server to avoid mismatch
      await loadAddresses();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">
            Saved Addresses
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 transition"
          >
            <LuX className="text-xl text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* ADD ADDRESS */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm">
            <p className="font-semibold text-gray-800">
              Add New Address
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[
                ["House No.", "house_no"],
                ["Street", "street"],
                ["Barangay", "barangay"],
                ["City", "city"],
                ["Province", "province"],
                ["Postal Code", "postal_code"],
              ].map(([placeholder, key]) => (
                <input
                  key={key}
                  placeholder={placeholder}
                  value={newAddress[key]}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      [key]: e.target.value,
                    })
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm
                  focus:ring-2 focus:ring-red-400 focus:border-red-400
                  hover:border-gray-300 transition outline-none"
                />
              ))}
            </div>

            <button
              onClick={handleAddAddress}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
            >
              <LuPlus />
              Add Address
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* LIST */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">
              Your Saved Addresses
            </p>

            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : addresses.length === 0 ? (
              <div className="text-sm text-gray-500 border border-dashed border-gray-300 p-4 rounded-xl">
                No saved addresses yet.
              </div>
            ) : (
              addresses.map((addr) => {
                const isSelected = addr.is_default;

                return (
                  <div
                    key={addr.address_id}
                    className={`flex items-center justify-between rounded-xl px-4 py-4 border transition
                    ${
                      isSelected
                        ? "bg-red-50 border-red-200"
                        : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
                    }`}
                  >
                    <button
                      onClick={() => handleSelectAddress(addr)}
                      className="flex items-center gap-3 text-left flex-1"
                    >
                      <LuMapPin className="text-gray-400" />

                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {formatAddress(addr)}
                        </p>

                        {isSelected && (
                          <p className="text-xs text-red-500 mt-1">
                            Default address
                          </p>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteAddress(addr.address_id)
                      }
                      className="text-gray-400 hover:text-red-600 transition p-2 rounded-lg hover:bg-red-50"
                    >
                      <LuTrash2 size={18} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}