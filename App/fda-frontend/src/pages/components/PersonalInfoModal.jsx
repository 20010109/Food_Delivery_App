import React, { useEffect, useState } from "react";
import { LuX } from "react-icons/lu";
import { supabase } from "../../utils/supabase.js";

export default function PersonalInfoModal({ open, onClose, onSaved }) {
  const [userId, setUserId] = useState(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    contact_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      setInitialLoading(true);
      setError("");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("User not found");
      }

      setUserId(user.id);

      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("first_name, last_name, contact_number")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      setForm({
        first_name: profile?.first_name || "",
        last_name: profile?.last_name || "",
        contact_number: profile?.contact_number || "",
      });
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadProfile();
    }
  }, [open]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError("");

      const { error: updateError } = await supabase
        .from("user_profiles")
        .upsert(
          {
            user_id: userId,
            first_name: form.first_name.trim(),
            last_name: form.last_name.trim(),
            contact_number: form.contact_number.trim(),
          },
          { onConflict: "user_id" }
        );

      if (updateError) throw updateError;

      if (onSaved) onSaved(form);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save profile");
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
          <h3 className="text-lg font-semibold">Personal Information</h3>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <LuX className="text-xl" />
          </button>
        </div>

        {initialLoading ? (
          <p className="text-sm text-gray-500">Loading profile...</p>
        ) : (
          <>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="First name"
                value={form.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              />

              <input
                type="text"
                placeholder="Last name"
                value={form.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              />

              <input
                type="text"
                placeholder="Contact number"
                value={form.contact_number}
                onChange={(e) => handleChange("contact_number", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              />
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
              {loading ? "Saving..." : "Update Profile"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}