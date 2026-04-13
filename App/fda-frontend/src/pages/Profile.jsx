import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase.js";
import "./styles/tailwind.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // 1. Get authenticated user
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
          navigate("/login");
          return;
        }

        const authUser = data.user;

        // 2. Fetch profile details
        const { data: profileDetails, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", authUser.id)
          .maybeSingle();

        if (profileError) {
          console.log("Profile fetch error:", profileError.message);
        }

        // 3. Merge data safely
        setUser({
          ...authUser,
          ...(profileDetails || {}),
        });
      } catch (err) {
        console.error("Unexpected error:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // Logout
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Loading state
  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center mt-10">No user found</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow bg-white">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>

      {/* BASIC INFO */}
      <div className="mb-2">
        <strong>Email:</strong> {user.email}
      </div>

      <div className="mb-2">
        <strong>User ID:</strong> {user.id}
      </div>

      {/* PROFILE INFO */}
      <div className="mb-2">
        <strong>First Name:</strong> {user.first_name || "N/A"}
      </div>

      <div className="mb-2">
        <strong>Last Name:</strong> {user.last_name || "N/A"}
      </div>

      <div className="mb-2">
        <strong>Contact Number:</strong> {user.contact_number || "N/A"}
      </div>

      <div className="mb-2">
        <strong>Role:</strong> {user.role || "N/A"}
      </div>

      {/* SIGN OUT */}
      <button
        onClick={handleSignOut}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Sign Out
      </button>
    </div>
  );
};

export default Profile;