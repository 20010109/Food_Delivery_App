import React, { useState } from "react";
import { supabase } from "../utils/supabase"; // adjust path
import { useParams } from "react-router-dom";

const CreateMenuItem = () => {
  const { restaurantId } = useParams();
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: ""
  });
  console.log("Restaurant ID from URL:", restaurantId);
  
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${Date.now()}.jpg`;

    const { error } = await supabase.storage
      .from("menu-images")
      .upload(filePath, imageFile);

    if (error) throw error;

    const { data } = supabase.storage
      .from("menu-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const imageUrl = await uploadImage();
      const session = await supabase.auth.getSession();

      const accessToken = session.data.session?.access_token;

      const res = await fetch("http://localhost:3000/api/menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        credentials: "include",
        body: JSON.stringify({
          restaurantId,
          ...form,
          price: Number(form.price),
          item_image: imageUrl
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setMessage("✅ Menu item created!");

      setForm({
        name: "",
        price: "",
        description: ""
      });
      setImageFile(null);

    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Add Menu Item</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">

        <input
          type="text"
          name="name"
          placeholder="Item Name"
          value={form.name}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white p-2 rounded"
        >
          {loading ? "Uploading..." : "Create Item"}
        </button>
      </form>

      {message && <p className="mt-3">{message}</p>}
    </div>
  );
};

export default CreateMenuItem;