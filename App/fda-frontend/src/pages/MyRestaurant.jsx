import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabase.js";
import { useNavigate } from "react-router-dom";

const MyRestaurant = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Unable to fetch user");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        setError(error.message);
      } else {
        setRestaurants(data);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p className="p-4">Loading restaurants...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Restaurants</h1>

      {restaurants.length === 0 ? (
        <p>No restaurants found.</p>
      ) : (
        <div className="grid gap-4">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="border rounded-lg p-4 shadow-sm"
            >
              <h2 className="text-xl font-semibold">
                {restaurant.name}
              </h2>

              <p className="text-gray-600">
                {restaurant.description || "No description"}
              </p>

              <p className="text-sm text-gray-400 mt-2">
                Status: {restaurant.status}
              </p>

              {/* ✅ Button to Create Menu Item */}
              <button
                onClick={() =>
                    navigate(`/myrestaurant/${restaurant.restaurant_id}/createmenuitem`)
                  }
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                + Add Menu Item
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRestaurant;