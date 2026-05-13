import React, { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase.js";
import { LuPencil, LuTrash2, LuPlus, LuX, LuImagePlus } from "react-icons/lu";

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

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100";

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Menu Management</h2>
          <p className="text-sm text-gray-400 mt-0.5">{items.length} item{items.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* GRID */}
      <div className="grid lg:grid-cols-[360px_1fr] gap-6">

        {/* FORM CARD */}
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-3 self-start">

          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            {editingId ? <><LuPencil size={15} /> Edit Item</> : <><LuPlus size={15} /> Add Item</>}
          </h3>

          <input
            className={inputClass}
            placeholder="Item name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            className={inputClass}
            type="number"
            placeholder="Price (₱)"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />

          <select
            className={inputClass}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="food">Food</option>
            <option value="drink">Drink</option>
          </select>

          <textarea
            className={`${inputClass} resize-none`}
            rows="3"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <label className="flex items-center gap-3 border border-dashed border-gray-300 rounded-xl p-3 cursor-pointer hover:border-red-400 hover:bg-white transition">
            <LuImagePlus size={18} className="text-gray-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-gray-500">
                {imageFile ? imageFile.name : "Upload image"}
              </p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
          </label>

          <button
            onClick={handleSubmit}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-semibold transition"
          >
            {editingId ? "Update Item" : "Create Item"}
          </button>

          {editingId && (
            <button
              onClick={resetForm}
              className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition"
            >
              <LuX size={13} /> Cancel Edit
            </button>
          )}
        </div>

        {/* LIST */}
        <div className="rounded-2xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Loading menu...</div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">No menu items yet. Add your first item!</div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {items.map((item) => (
                <div key={item.item_id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition">

                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    {item.item_image ? (
                      <img src={item.item_image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <LuImagePlus size={18} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-medium text-red-600">₱{item.price}</span>
                      <span className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-0.5 rounded-full">{item.category}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(item)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                    >
                      <LuPencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.item_id)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition"
                    >
                      <LuTrash2 size={13} />
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
