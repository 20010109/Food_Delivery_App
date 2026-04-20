import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase.js";
import "./styles/tailwind.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    const fetchUserAndAddress = async () => {
      try {
        // ✅ Get authenticated user
        const { data, error } = await supabase.auth.getUser();
  
        if (error || !data.user) {
          navigate("/login");
          return;
        }
  
        const authUser = data.user;
  
        // ✅ Get profile details
        const { data: profileDetails } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", authUser.id)
          .maybeSingle();
  
        // ✅ Get session (for token)
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        console.log("FRONTEND TOKEN:", token);
  
        // ✅ Fetch addresses from YOUR BACKEND
        const res = await fetch("http://localhost:3000/api/addresses", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!res.ok) {
          throw new Error("Failed to fetch addresses");
        }
  
        const addressData = await res.json();
  
        setUser({
          ...authUser,
          ...(profileDetails || {}),
        });
  
        setAddresses(addressData);
  
      } catch (err) {
        console.error(err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserAndAddress();
  }, [navigate]);

  
  

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center mt-10 text-gray-500">
        No user found
      </div>
    );
  }

  const initials =
    (user.first_name?.[0] || "") + (user.last_name?.[0] || "");

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start p-6">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white text-blue-600 flex items-center justify-center text-xl font-bold">
              {initials || "U"}
            </div>

            <div>
              <h2 className="text-xl font-bold">
                {user.first_name || "User"} {user.last_name || ""}
              </h2>
              <p className="text-sm opacity-90">{user.email}</p>

              <span className="inline-block mt-1 px-2 py-1 text-xs bg-white text-blue-600 rounded-full font-medium">
                {user.role || "No role"}
              </span>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">

          {/* ACCOUNT INFO */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
              Account Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500">User ID</p>
                <p className="font-medium break-all">{user.id}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
          </div>

          {/* PROFILE INFO */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
              Profile Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500">First Name</p>
                <p className="font-medium">
                  {user.first_name || "Not set"}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Last Name</p>
                <p className="font-medium">
                  {user.last_name || "Not set"}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Contact</p>
                <p className="font-medium">
                  {user.contact_number || "Not set"}
                </p>
              </div>
            </div>
          </div>

          {/* ADDRESS INFO */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
              Addresses
            </h3>

            {addresses.length === 0 ? (
              <p className="text-gray-500 text-sm">No addresses found</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.address_id}
                    className="p-3 bg-gray-50 rounded-lg text-sm"
                  >
                    <p className="font-medium">{addr.address_line}</p>
                    <p className="text-gray-500 text-xs">
                      Lat: {addr.latitude} | Lng: {addr.longitude}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => alert("Edit profile coming soon")}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>

            <button
              onClick={handleSignOut}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Sign Out
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;