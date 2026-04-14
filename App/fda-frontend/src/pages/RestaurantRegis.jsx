import { useState } from "react";
import { supabase } from "../utils/supabase.js";

export default function RestaurantRegistration() {
  const [profileFile, setProfileFile] = useState(null);
  const [backgroundFile, setBackgroundFile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    contact_info: "",
    address_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Upload image to Supabase Storage
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
      // Validate images
      if (!profileFile || !backgroundFile) {
        throw new Error("Please upload both images");
      }

      // Get session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Not authenticated");
      }

      // Upload images first
      const profileImageUrl = await uploadImage(profileFile, "profile");
      const backgroundImageUrl = await uploadImage(backgroundFile, "background");

      // Send to backend
      const res = await fetch("http://localhost:3000/api/restaurants", {
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
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create restaurant");
      }

      setMessage("Restaurant submitted for approval ✅");

      // Reset form
      setForm({
        name: "",
        contact_info: "",
        address_id: "",
      });
      setProfileFile(null);
      setBackgroundFile(null);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Register Your Restaurant
        </h2>

        {message && (
          <div className="mb-4 text-center text-sm text-blue-600">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Restaurant Name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />

          <input
            name="contact_info"
            placeholder="Contact Info"
            value={form.contact_info}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />

          <input
            name="address_id"
            placeholder="Address ID"
            value={form.address_id}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          />

          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Profile Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfileFile(e.target.files[0])}
              className="w-full"
            />
          </div>

          {/* Background Image */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Background Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBackgroundFile(e.target.files[0])}
              className="w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition"
          >
            {loading ? "Submitting..." : "Create Restaurant"}
          </button>
        </form>
      </div>
    </div>
  );
}