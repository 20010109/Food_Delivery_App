import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuArrowLeft,
  LuMail,
  LuPhone,
  LuMapPin,
  LuShield,
  LuLogOut,
  LuPencil,
  LuUser,
  LuIdCard,
} from "react-icons/lu";
import { supabase } from "../utils/supabase.js";
import DefaultProfile from "../assets/Stock_User.jpg";
import "./styles/tailwind.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndAddress = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
          navigate("/login");
          return;
        }

        const authUser = data.user;

        const { data: profileDetails } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", authUser.id)
          .maybeSingle();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        const token = session?.access_token;

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

  const getRoleLabel = (role) => {
    switch (role) {
      case "storeowner":
        return "Store Owner";
      case "customer":
        return "Customer";
      case "admin":
        return "Admin";
      case "rider":
        return "Rider";
      default:
        return "Guest";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-500">
        No user found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition mb-6"
        >
          <LuArrowLeft />
          Back to Home
        </button>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Top Banner */}
          <div className="bg-gray-900 px-8 py-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-5">
                <img
                  src={user?.profile_image || DefaultProfile}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
                />

                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-red-300 mb-2">
                    My Profile
                  </p>

                  <h1 className="text-3xl font-bold leading-tight">
                    {user.first_name || "User"} {user.last_name || ""}
                  </h1>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-300">
                    <span className="inline-flex items-center gap-2">
                      <LuMail className="text-red-400" />
                      {user.email}
                    </span>

                    <span className="inline-flex items-center rounded-full bg-red-600/15 border border-red-500/20 px-3 py-1 text-xs font-semibold text-red-300">
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => alert("Edit profile coming soon")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-gray-900 px-5 py-3 font-semibold hover:bg-gray-100 transition"
                >
                  <LuPencil />
                  Edit Profile
                </button>

                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 text-white px-5 py-3 font-semibold hover:bg-red-700 transition"
                >
                  <LuLogOut />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="xl:col-span-2 space-y-6">
              <section className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <LuUser className="text-red-500" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Personal Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-white border border-gray-200 p-4">
                    <p className="text-sm text-gray-500 mb-1">First Name</p>
                    <p className="font-semibold text-gray-900">
                      {user.first_name || "Not set"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white border border-gray-200 p-4">
                    <p className="text-sm text-gray-500 mb-1">Last Name</p>
                    <p className="font-semibold text-gray-900">
                      {user.last_name || "Not set"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white border border-gray-200 p-4 sm:col-span-2">
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <LuPhone className="text-red-500" />
                      Contact Number
                    </p>
                    <p className="font-semibold text-gray-900">
                      {user.contact_number || "Not set"}
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <LuMapPin className="text-red-500" />
                  <h2 className="text-xl font-bold text-gray-900">Addresses</h2>
                </div>

                {addresses.length === 0 ? (
                  <div className="rounded-xl bg-white border border-dashed border-gray-300 p-6 text-gray-500">
                    No saved addresses yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((addr, index) => (
                      <div
                        key={addr.address_id}
                        className="rounded-xl bg-white border border-gray-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {addr.address_line}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Address {index + 1}
                            </p>
                          </div>

                          {index === 0 && (
                            <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                              Primary
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-400 mt-3">
                          Lat: {addr.latitude || "-"} | Lng: {addr.longitude || "-"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <section className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <LuShield className="text-red-500" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Account Overview
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl bg-white border border-gray-200 p-4">
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <LuIdCard className="text-red-500" />
                      User ID
                    </p>
                    <p className="font-semibold text-gray-900 break-all">
                      {user.id}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white border border-gray-200 p-4">
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <LuMail className="text-red-500" />
                      Email Address
                    </p>
                    <p className="font-semibold text-gray-900 break-all">
                      {user.email}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white border border-gray-200 p-4">
                    <p className="text-sm text-gray-500 mb-1">Role</p>
                    <p className="font-semibold text-gray-900">
                      {getRoleLabel(user.role)}
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-gray-900 rounded-2xl p-6 text-white">
                <p className="text-sm uppercase tracking-[0.2em] text-red-300 mb-2">
                  Grubero
                </p>
                <h3 className="text-xl font-bold leading-snug">
                  Keep your account details updated for faster ordering and delivery.
                </h3>
                <p className="text-sm text-gray-300 mt-3 leading-6">
                  Your saved profile and address details help make checkout quicker
                  across Home, Explore, and Store pages.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;