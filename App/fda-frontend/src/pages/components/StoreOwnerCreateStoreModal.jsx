import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase.js";

function StoreOwnerCreateStoreModal({ open, onClose, onSuccess }) {
  const [profileFile, setProfileFile] = useState(null);
  const [backgroundFile, setBackgroundFile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    contact_info: "",
    address_id: "",
  });

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open) fetchAddresses();
  }, [open]);

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("addresses")
        .select("address_id, address_line")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAddresses(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAddresses(false);
    }
  };

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
        throw new Error("Please upload both images.");
      }

      if (!form.address_id) {
        throw new Error("Please select an address.");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error("Not authenticated");

      const profileImageUrl = await uploadImage(profileFile, "profile");
      const backgroundImageUrl = await uploadImage(
        backgroundFile,
        "background"
      );

      const res = await fetch(
        "http://localhost:3000/api/restaurants/storeowner/create",
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
        throw new Error(data.error || "Failed to create restaurant.");
      }

      setMessage("Restaurant submitted for approval.");

      setForm({
        name: "",
        contact_info: "",
        address_id: "",
      });

      setProfileFile(null);
      setBackgroundFile(null);

      onSuccess && onSuccess();
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/20";

  const uploadCard =
    "cursor-pointer rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5 transition hover:border-red-500 hover:bg-gray-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">

        {/* HEADER */}
        <div className="border-b border-gray-200 bg-gray-900 px-8 py-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Create Restaurant
              </h2>
              <p className="mt-1 text-sm text-gray-300">
                Launch your business and manage orders with Grubero.
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-300 transition hover:bg-red-600 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="max-h-[85vh] space-y-6 overflow-y-auto px-8 py-7"
        >
          {message && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {message}
            </div>
          )}

          {/* STORE INFO */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-600">
              Store Information
            </h3>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-gray-700">
                  Restaurant Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ex. Grubero Burgers"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-700">
                  Contact Information
                </label>
                <input
                  name="contact_info"
                  value={form.contact_info}
                  onChange={handleChange}
                  placeholder="Contact No."
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-700">
                  Restaurant Address
                </label>

                <select
                  name="address_id"
                  value={form.address_id}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">
                    {loadingAddresses
                      ? "Loading addresses..."
                      : "Choose saved address"}
                  </option>

                  {addresses.map((address) => (
                    <option
                      key={address.address_id}
                      value={address.address_id}
                    >
                      {address.address_line}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* IMAGES */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-600">
              Branding Images
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <label className={uploadCard}>
                <div className="text-center space-y-2">
                  <div className="text-3xl">🏪</div>
                  <p className="font-semibold">Profile Image</p>
                  <p className="text-xs text-gray-500">
                    Logo or storefront photo
                  </p>
                  {profileFile && (
                    <p className="text-xs text-red-500 truncate">
                      {profileFile.name}
                    </p>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setProfileFile(e.target.files[0])
                  }
                />
              </label>

              <label className={uploadCard}>
                <div className="text-center space-y-2">
                  <div className="text-3xl">🌄</div>
                  <p className="font-semibold">Cover Image</p>
                  <p className="text-xs text-gray-500">
                    Banner for your restaurant page
                  </p>
                  {backgroundFile && (
                    <p className="text-xs text-red-500 truncate">
                      {backgroundFile.name}
                    </p>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setBackgroundFile(e.target.files[0])
                  }
                />
              </label>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-5 py-3 text-sm text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Create Restaurant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StoreOwnerCreateStoreModal;