import React, { useState } from "react";
import { LuX, LuCamera, LuLoader } from "react-icons/lu";
import { supabase } from "../utils/supabase.js";

const EditProfileModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    contact_number: user?.contact_number || "",
    profile_image: user?.profile_image || "",
  });

  const [previewImage, setPreviewImage] = useState(user?.profile_image || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const uploadImageToSupabase = async (file) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user_id = authData.user.id;

      // Create a unique file name
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop();
      const fileName = `profile_${user_id}_${timestamp}.${fileExtension}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from("profile-images") // Make sure this bucket exists in Supabase
        .upload(`profiles/${fileName}`, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage
        .from("profile-images")
        .getPublicUrl(`profiles/${fileName}`);

      return publicUrl;
    } catch (err) {
      throw new Error(`Image upload failed: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required fields
      if (!formData.first_name || !formData.last_name) {
        setError("First name and last name are required");
        setLoading(false);
        return;
      }

      let imageUrl = formData.profile_image;

      // Upload new image if selected
      if (selectedFile) {
        imageUrl = await uploadImageToSupabase(selectedFile);
      }

      // Get auth token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Call API to update profile
      const res = await fetch(
        `http://localhost:3000/api/users/profile/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            first_name: formData.first_name,
            last_name: formData.last_name,
            contact_number: formData.contact_number,
            profile_image: imageUrl,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      setSuccess(true);
      setTimeout(() => {
        onSave();
      }, 1500);
    } catch (err) {
      setError(err.message || "An error occurred while updating your profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 p-6 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
            aria-label="Close"
          >
            <LuX size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <img
                src={previewImage || "https://via.placeholder.com/120"}
                alt="Profile preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />
              <label
                htmlFor="imageInput"
                className="absolute bottom-0 right-0 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition cursor-pointer shadow-lg"
              >
                <LuCamera size={18} />
                <input
                  id="imageInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                  disabled={loading}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Max 5MB • JPG, PNG, or GIF
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">Profile updated successfully!</p>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="Enter your first name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Enter your last name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number
              </label>
              <input
                type="tel"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleInputChange}
                placeholder="Enter your contact number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                disabled={loading}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading && <LuLoader className="animate-spin" size={18} />}
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
