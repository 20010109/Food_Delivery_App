import React, { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase.js";

function MenuSection({ restaurantId }) {
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
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500";

  const cardClass =
    "rounded-2xl border bg-white shadow-sm";

  // ================= AUTH =================
  const sessionToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };

  // ================= FETCH MENU =================
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
    if (restaurantId) fetchItems();
  }, [restaurantId]);

  // ================= IMAGE UPLOAD =================
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

  // ================= RESET =================
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

  // ================= CREATE / UPDATE =================
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

  // ================= DELETE =================
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

  // ================= EDIT =================
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

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Menu Management
        </h2>

        <span className="text-sm text-gray-500">
          {items.length} items
        </span>
      </div>

      {/* ================= GRID ================= */}
      <div className="grid lg:grid-cols-[380px_1fr] gap-6">

        {/* ================= FORM ================= */}
        <div className={`${cardClass} p-5 space-y-4`}>

          <h3 className="font-semibold">
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
            rows="3"
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />

          <label className="block border border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-red-500">
            <p className="text-sm">Upload Image</p>

            {imageFile && (
              <p className="text-xs text-red-500 mt-1 truncate">
                {imageFile.name}
              </p>
            )}

            <input
              type="file"
              className="hidden"
              onChange={(e) =>
                setImageFile(e.target.files[0])
              }
            />
          </label>

          <button
            onClick={handleSubmit}
            className="w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600"
          >
            {editingId ? "Update Item" : "Create Item"}
          </button>

          {editingId && (
            <button
              onClick={resetForm}
              className="w-full text-sm text-gray-500"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {/* ================= LIST ================= */}
        <div className={`${cardClass} p-5`}>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-gray-500">
              No menu items yet.
            </p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">

              {items.map((item) => (
                <div
                  key={item.item_id}
                  className="flex items-center justify-between p-3 border rounded-xl"
                >

                  <div className="flex gap-3 items-center">

                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                      {item.item_image ? (
                        <img
                          src={item.item_image}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div>
                      <p className="font-semibold">
                        {item.name}
                      </p>

                      <p className="text-sm text-red-500">
                        ₱{item.price}
                      </p>

                      <p className="text-xs text-gray-500">
                        {item.category}
                      </p>
                    </div>

                  </div>

                  <div className="flex gap-2">

                    <button
                      onClick={() => handleEdit(item)}
                      className="text-sm px-3 py-1 bg-gray-100 rounded-lg"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(item.item_id)
                      }
                      className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded-lg"
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
  );
}

export default MenuSection;