import React, { useState } from "react";
import { supabase } from "../../utils/supabase.js";

function StoreOwnerCreateStoreModal({ open, onClose, onSuccess }) {
  const [profileFile, setProfileFile] = useState(null);
  const [backgroundFile, setBackgroundFile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    contact_info: "",
    address_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!open) return null;

  const uploadImage = async (file, folder) => {
    if (!file) return null;

    const fileName = `${folder}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("restaurant-images")
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("restaurant-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!profileFile || !backgroundFile) {
        throw new Error("Please upload both images");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Not authenticated");
      }

      // upload images
      const profileImageUrl = await uploadImage(profileFile, "profile");
      const backgroundImageUrl = await uploadImage(backgroundFile, "background");

      // create restaurant
      const res = await fetch(
        "http://localhost:3000/api/restaurants/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            ...form,
            profile_image: profileImageUrl,
            background_image: backgroundImageUrl,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create restaurant");
      }

      setMessage("Restaurant submitted for approval ✅");

      // reset
      setForm({
        name: "",
        contact_info: "",
        address_id: "",
      });
      setProfileFile(null);
      setBackgroundFile(null);

      // 🔥 refresh dashboard
      onSuccess && onSuccess();

      // optional auto close
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-lg space-y-4">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Create Restaurant
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className="text-sm text-center text-blue-600">
            {message}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            name="name"
            placeholder="Restaurant Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          />

          <input
            name="contact_info"
            placeholder="Contact Info"
            value={form.contact_info}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          />

          <input
            name="address_id"
            placeholder="Address ID"
            value={form.address_id}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />

          {/* IMAGES */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfileFile(e.target.files[0])}
              className="w-full border rounded-lg px-3 py-2"
            />

            <label className="text-sm text-gray-600">Background Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBackgroundFile(e.target.files[0])}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              {loading ? "Submitting..." : "Create"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default StoreOwnerCreateStoreModal;