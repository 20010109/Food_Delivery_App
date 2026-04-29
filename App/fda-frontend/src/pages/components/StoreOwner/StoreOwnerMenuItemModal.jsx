import React, { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase.js";

function StoreOwnerMenuModal({ open, onClose, restaurantId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "food",
  });

  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const inputClass =
    "w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder:text-gray-400 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/20";

  const cardClass =
    "rounded-2xl border border-gray-800 bg-gray-900";

  const sessionToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };

  const fetchItems = async () => {
    if (!restaurantId) return;

    try {
      setLoading(true);

      const token = await sessionToken();

      const res = await fetch(
        `http://localhost:3000/api/menu/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok || !Array.isArray(data)) {
        setItems([]);
        return;
      }

      setItems(data);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && restaurantId) {
      fetchItems();
    }
  }, [open, restaurantId]);

  const uploadImage = async () => {
    if (!imageFile) return null;

    const filePath = `menu/${Date.now()}-${imageFile.name}`;

    const { error } = await supabase.storage
      .from("menu-images")
      .upload(filePath, imageFile);

    if (error) throw error;

    const { data } = supabase.storage
      .from("menu-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      description: "",
      category: "food",
    });

    setImageFile(null);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    try {
      const token = await sessionToken();
      const imageUrl = await uploadImage();

      const payload = {
        restaurant_id: restaurantId,
        name: form.name,
        price: Number(form.price),
        description: form.description,
        category: form.category,
      };

      if (imageUrl) payload.item_image = imageUrl;

      const url = editingId
        ? `http://localhost:3000/api/menu/${editingId}`
        : `http://localhost:3000/api/menu`;

      const method = editingId ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      resetForm();
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const token = await sessionToken();

    await fetch(`http://localhost:3000/api/menu/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchItems();
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name,
      price: item.price,
      description: item.description,
      category: item.category || "food",
    });

    setImageFile(null);
    setEditingId(item.item_id);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-gray-800 bg-gray-900 text-white shadow-2xl">

        {/* HEADER */}
        <div className="border-b border-gray-800 bg-gray-950 px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Menu Manager
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Create and manage your restaurant menu items
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
        <div className="grid gap-6 p-8 lg:grid-cols-[380px_1fr]">

          {/* FORM */}
          <div className={`${cardClass} p-6 space-y-4`}>

            <h3 className="text-lg font-semibold">
              {editingId ? "Edit Item" : "Add Item"}
            </h3>

            <input
              className={inputClass}
              placeholder="Item name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              className={inputClass}
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
            />

            {/* CATEGORY */}
            <select
              className={inputClass}
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value,
                })
              }
            >
              <option value="food">Food</option>
              <option value="drink">Drink</option>
            </select>

            <textarea
              className={`${inputClass} resize-none`}
              rows="4"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />

            <label className="block cursor-pointer rounded-xl border border-dashed border-gray-700 bg-gray-800 p-4 text-center hover:border-red-500 transition">
              <p className="text-sm font-medium">
                Upload Image
              </p>

              {imageFile && (
                <p className="text-xs text-red-400 mt-1 truncate">
                  {imageFile.name}
                </p>
              )}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  setImageFile(e.target.files[0])
                }
              />
            </label>

            <button
              onClick={handleSubmit}
              className="w-full bg-red-600 hover:bg-red-700 rounded-xl py-3 font-semibold transition"
            >
              {editingId ? "Update Item" : "Create Item"}
            </button>

            {editingId && (
              <button
                onClick={resetForm}
                className="w-full text-sm text-gray-400 hover:text-white"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {/* LIST */}
          <div className={`${cardClass} p-6`}>

            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Current Menu
              </h3>

              <span className="text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-400">
                {items.length} items
              </span>
            </div>

            {loading ? (
              <p className="text-gray-400 text-sm">
                Loading...
              </p>
            ) : items.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No items yet.
              </p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">

                {items.map((item) => (
                  <div
                    key={item.item_id}
                    className="flex justify-between items-center bg-gray-800 p-4 rounded-2xl border border-gray-700"
                  >
                    <div className="flex gap-3 items-center">

                      <div className="w-12 h-12 rounded-lg bg-gray-700 overflow-hidden">
                        {item.item_image ? (
                          <img
                            src={item.item_image}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-xs flex items-center justify-center h-full text-gray-400">
                            No img
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="font-semibold">
                          {item.name}
                        </p>

                        <p className="text-sm text-red-400">
                          ₱{item.price}
                        </p>

                        <p className="text-xs text-gray-400 capitalize">
                          {item.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">

                      <button
                        onClick={() => handleEdit(item)}
                        className="px-3 py-1 bg-gray-700 rounded-lg text-sm hover:bg-gray-600"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(item.item_id)
                        }
                        className="px-3 py-1 bg-red-600 rounded-lg text-sm hover:bg-red-700"
                      >
                        Delete
                      </button>

                    </div>
                  </div>
                ))}

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default StoreOwnerMenuModal;