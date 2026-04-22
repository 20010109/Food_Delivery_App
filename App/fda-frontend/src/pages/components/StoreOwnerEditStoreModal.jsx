import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase.js";

function StoreOwnerEditStoreModal({
  open,
  onClose,
  restaurant,
  onSave,
}) {
  const [profileFile, setProfileFile] = useState(null);
  const [bgFile, setBgFile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    profile_image: "",
    background_image: "",
  });

  useEffect(() => {
    if (restaurant) {
      setForm({
        name: restaurant.name || "",
        profile_image: restaurant.profile_image || "",
        background_image: restaurant.background_image || "",
      });
    }
  }, [restaurant]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const uploadImage = async (file, folder) => {
    if (!file) return null;

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from("restaurant-images")
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("restaurant-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async () => {
    try {
      let profileUrl = form.profile_image;
      let backgroundUrl = form.background_image;

      if (profileFile) {
        profileUrl = await uploadImage(profileFile, "profile");
      }

      if (bgFile) {
        backgroundUrl = await uploadImage(bgFile, "background");
      }

      onSave({
        name: form.name,
        profile_image: profileUrl,
        background_image: backgroundUrl,
      });
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-lg space-y-4">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Restaurant
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* BACKGROUND PREVIEW */}
        <div
          className="w-full h-40 rounded-xl bg-gray-100 bg-center bg-cover border"
          style={{
            backgroundImage: form.background_image
              ? `url(${form.background_image})`
              : "none",
          }}
        >
          {!form.background_image && (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Background preview
            </div>
          )}
        </div>

        {/* PROFILE PREVIEW */}
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full overflow-hidden border bg-gray-100">
            {form.profile_image ? (
              <img
                src={form.profile_image}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-gray-400">
                No Image
              </div>
            )}
          </div>

          <span className="text-sm text-gray-500">
            Profile Image Preview
          </span>
        </div>

        {/* FORM */}
        <div className="space-y-3">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Restaurant Name"
            className="w-full border rounded-lg px-3 py-2"
          />

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
              onChange={(e) => setBgFile(e.target.files[0])}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}

export default StoreOwnerEditStoreModal;