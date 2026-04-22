import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase.js";

function StoreOwnerMenuModal({ open, onClose, restaurantId }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const sessionToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };

  const fetchItems = async () => {
    if (!restaurantId) return;

    const token = await sessionToken();

    const res = await fetch(
      `http://localhost:3000/api/menu/${restaurantId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    setItems(data);
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

  const handleSubmit = async () => {
    const token = await sessionToken();
    const imageUrl = await uploadImage();

    const payload = {
    restaurant_id: restaurantId,
    name: form.name,
    price: Number(form.price),
    description: form.description,
    };

    // only overwrite image if user uploaded a new one
    if (imageUrl) {
    payload.item_image = imageUrl;
    }

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

    setForm({ name: "", price: "", description: "" });
    setImageFile(null);
    setEditingId(null);
    fetchItems();
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
    });
  
    setImageFile(null); // ✅ important
    setEditingId(item.item_id);
  };

  // ✅ SAFE EARLY RETURN (AFTER HOOKS)
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl p-6 rounded-xl space-y-4">

        {/* HEADER */}
        <div className="flex justify-between">
          <h2 className="text-xl font-bold">Menu Manager</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* FORM */}
        <div className="grid gap-2">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            placeholder="Price"
            type="number"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value })
            }
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <input
            type="file"
            onChange={(e) => setImageFile(e.target.files[0])}
          />

          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white p-2 rounded"
          >
            {editingId ? "Update Item" : "Create Item"}
          </button>
          <button
            onClick={() => {
                setForm({ name: "", price: "", description: "" });
                setImageFile(null);
                setEditingId(null);
            }}
            className="text-sm text-gray-500"
          >
            Cancel Edit
          </button>
        </div>

        {/* LIST */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.item_id}
              className="flex justify-between border p-2 rounded"
            >
                
                <div className="flex items-center gap-3">
                    {/* IMAGE */}
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.item_image ? (
                        <img
                            src={item.item_image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                        />
                        ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            No img
                        </div>
                        )}
                    </div>

                    {/* TEXT */}
                    <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-sm text-gray-500">₱{item.price}</p>
                    </div>
                    </div>

              <div className="flex gap-2">
                <button onClick={() => handleEdit(item)}>Edit</button>
                <button onClick={() => handleDelete(item.item_id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default StoreOwnerMenuModal;