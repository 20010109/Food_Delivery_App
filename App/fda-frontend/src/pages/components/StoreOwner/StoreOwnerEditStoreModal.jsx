import React, { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase.js";

function StoreOwnerEditStoreModal({
  open,
  onClose,
  restaurant,
  onSave,
}) {
  const [profileFile, setProfileFile] = useState(null);
  const [bgFile, setBgFile] = useState(null);

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [form, setForm] = useState({
    name: "",
    contact_info: "",
    profile_image: "",
    background_image: "",
    address_id: "",
  });

  useEffect(() => {
    if (restaurant) {
      setForm({
        name: restaurant.name || "",
        contact_info: restaurant.contact_info || "",
        profile_image: restaurant.profile_image || "",
        background_image: restaurant.background_image || "",
        address_id: restaurant.address_id || "",
      });
    }
  }, [restaurant]);

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
        .select(
          "address_id, house_no, street, barangay, city, province"
        )
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

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const uploadImage = async (file, folder) => {
    if (!file) return null;

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()}.${ext}`;
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
        contact_info: form.contact_info,
        profile_image: profileUrl,
        background_image: backgroundUrl,
        address_id: form.address_id,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder:text-gray-400 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/20";

  const uploadCard =
    "cursor-pointer rounded-xl border border-dashed border-gray-700 bg-gray-800 px-4 py-4 text-center transition hover:border-red-500";

  const formatAddress = (addr) => {
    return [
      addr.house_no,
      addr.street,
      addr.barangay,
      addr.city,
      addr.province,
    ]
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-gray-800 bg-gray-900 text-white shadow-2xl">

        {/* HEADER */}
        <div className="border-b border-gray-800 px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Edit Restaurant
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Update your store branding and details.
              </p>
            </div>

            <button
              onClick={onClose}
              className="h-10 w-10 rounded-full bg-gray-800 text-gray-300 hover:bg-red-600 hover:text-white transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="max-h-[85vh] overflow-y-auto px-8 py-7 space-y-8">

          {/* LIVE PREVIEW */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Live Preview
            </h3>

            <div className="rounded-3xl overflow-hidden border border-gray-800 bg-gray-800">

              {/* COVER IMAGE */}
              <div
                className="relative h-52 bg-cover bg-center"
                style={{
                  backgroundImage: form.background_image
                    ? `url(${form.background_image})`
                    : "none",
                }}
              >
                {!form.background_image && (
                  <div className="flex h-full items-center justify-center text-sm text-gray-500">
                    No Cover Image
                  </div>
                )}

                {/* PROFILE IMAGE INSIDE COVER */}
                <div className="absolute bottom-4 left-6 flex items-end gap-4">
                  <div className="h-20 w-20 overflow-hidden rounded-2xl border-4 border-gray-900 bg-gray-700 shadow-lg">
                    {form.profile_image ? (
                      <img
                        src={form.profile_image}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400">
                        No Img
                      </div>
                    )}
                  </div>

                  <div className="pb-1">
                    <h4 className="text-xl font-bold drop-shadow">
                      {form.name || "Restaurant Name"}
                    </h4>
                    <p className="text-sm text-gray-200">
                      {form.contact_info || "Contact Info"}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* FORM */}
          <div className="space-y-5">

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Restaurant Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Contact Information
              </label>
              <input
                name="contact_info"
                value={form.contact_info}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Restaurant Address
              </label>

              <select
                name="address_id"
                value={form.address_id}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">
                  {loadingAddresses
                    ? "Loading addresses..."
                    : "Select address"}
                </option>

                {addresses.map((addr) => (
                  <option
                    key={addr.address_id}
                    value={addr.address_id}
                  >
                    {formatAddress(addr)}
                  </option>
                ))}
              </select>
            </div>

            {/* IMAGE UPLOADS */}
            <div className="grid gap-4 md:grid-cols-2">

              <label className={uploadCard}>
                <p className="font-medium">
                  Upload Profile Image
                </p>
                <p className="text-xs text-gray-400">
                  Logo or storefront photo
                </p>

                {profileFile && (
                  <p className="mt-1 text-xs text-red-400 truncate">
                    {profileFile.name}
                  </p>
                )}

                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) =>
                    setProfileFile(e.target.files[0])
                  }
                />
              </label>

              <label className={uploadCard}>
                <p className="font-medium">
                  Upload Cover Image
                </p>
                <p className="text-xs text-gray-400">
                  Banner background
                </p>

                {bgFile && (
                  <p className="mt-1 text-xs text-red-400 truncate">
                    {bgFile.name}
                  </p>
                )}

                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) =>
                    setBgFile(e.target.files[0])
                  }
                />
              </label>

            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 border-t border-gray-800 pt-6">
            <button
              onClick={onClose}
              className="rounded-xl border border-gray-700 px-5 py-3 text-sm text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              className="rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold hover:bg-red-700"
            >
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default StoreOwnerEditStoreModal;