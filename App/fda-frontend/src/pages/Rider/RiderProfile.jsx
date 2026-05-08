import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  LuTruck,
  LuStar,
  LuFileCheck,
} from "react-icons/lu";
import { supabase } from "../../utils/supabase.js";
import DefaultProfile from "../../assets/Stock_User.jpg";
import EditProfileModal from "../EditProfileModal.jsx";
import "../../App.css";

const RiderProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [riderData, setRiderData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchRiderProfile = async () => {
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

        // Fetch rider-specific data
        let riderInfo = null;
        try {
          const res = await fetch("http://localhost:3000/api/rider/me", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            riderInfo = await res.json();
          }
        } catch (err) {
          console.warn("Could not fetch rider data:", err);
        }

        setUser({
          ...authUser,
          ...(profileDetails || {}),
        });

        setRiderData(riderInfo);
      } catch (err) {
        console.error(err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchRiderProfile();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleEditSave = async () => {
    setIsEditModalOpen(false);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center max-w-lg mx-auto">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center max-w-lg mx-auto">
        <div className="text-gray-400 text-sm">No user found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto pb-24">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-4 sticky top-0 z-10 flex items-center justify-between">
        <button
          onClick={() => navigate("/rider/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <LuArrowLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h1 className="text-lg font-bold text-gray-900">My Profile</h1>
        <div className="w-8" /> {/* Spacer for alignment */}
      </div>

      {/* CONTENT */}
      <div className="px-4 py-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-6 text-white flex items-center gap-4">
            <img
              src={user?.profile_image || DefaultProfile}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border-3 border-white/20"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-xs text-gray-300 mt-1">Delivery Rider</p>
            </div>
          </div>

          <div className="px-4 py-3 space-y-2 border-b border-gray-50">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <LuMail size={14} />
              <span className="truncate">{user.email}</span>
            </div>
            {user.contact_number && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <LuPhone size={14} />
                <span>{user.contact_number}</span>
              </div>
            )}
          </div>

          <div className="px-4 py-3 flex gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 bg-gray-900 text-white py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-1"
            >
              <LuPencil size={14} />
              Edit
            </button>
            <button
              onClick={handleSignOut}
              className="flex-1 bg-red-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-red-700 transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <div className="flex items-center gap-2 mb-0">
              <LuUser size={16} className="text-gray-900" />
              <h3 className="font-bold text-gray-900 text-sm">Personal Information</h3>
            </div>
          </div>

          <div className="px-4 py-3 space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">First Name</p>
              <p className="text-sm font-semibold text-gray-900">
                {user.first_name || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Last Name</p>
              <p className="text-sm font-semibold text-gray-900">
                {user.last_name || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                <LuPhone size={12} />
                Contact Number
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {user.contact_number || "Not set"}
              </p>
            </div>
            {user.address && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                  <LuMapPin size={12} />
                  Address
                </p>
                <p className="text-sm font-semibold text-gray-900">{user.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Statistics */}
        {/* {riderData && (*
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <LuTruck size={16} className="text-gray-900" />
                <h3 className="font-bold text-gray-900 text-sm">Delivery Stats</h3>
              </div>
            </div>

            <div className="px-4 py-3 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Deliveries</span>
                <span className="font-bold text-gray-900">
                  {riderData.total_deliveries || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <LuStar size={14} className="text-yellow-500" />
                  Rating
                </span>
                <span className="font-bold text-gray-900">
                  {riderData.average_rating?.toFixed(1) || "N/A"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="font-bold text-green-600">
                  {riderData.completed_this_month || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Acceptance Rate</span>
                <span className="font-bold text-gray-900">
                  {riderData.acceptance_rate?.toFixed(1) || "N/A"}%
                </span>
              </div>
            </div>
          </div>
        )} */}

        {/* Documentation */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <LuFileCheck size={16} className="text-gray-900" />
              <h3 className="font-bold text-gray-900 text-sm">Documentation</h3>
            </div>
          </div>

          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-700">Driver License</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                ✓ Verified
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-700">Vehicle Registration</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                ✓ Verified
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">Insurance</span>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold">
                ⊘ Pending
              </span>
            </div>
          </div>
        </div>

        {/* Account Overview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <LuShield size={16} className="text-gray-900" />
              <h3 className="font-bold text-gray-900 text-sm">Account</h3>
            </div>
          </div>

          <div className="px-4 py-3 space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                <LuIdCard size={12} />
                Rider ID
              </p>
              <p className="text-xs font-semibold text-gray-900 break-all">
                {user.id}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                <LuMail size={12} />
                Email
              </p>
              <p className="text-xs font-semibold text-gray-900 break-all">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-0.5">Status</p>
              <div className="flex gap-1">
                {user.is_active ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                    ✓ Active
                  </span>
                ) : (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                    ⊘ Inactive
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Grubero Message */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-4 text-white">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1 font-semibold">
            Grubero Riders
          </p>
          <h4 className="font-bold text-sm leading-snug mb-1">
            Keep your profile updated for better earnings.
          </h4>
          <p className="text-xs text-gray-300 leading-relaxed">
            Your ratings and delivery performance unlock premium deliveries and
            exclusive incentives.
          </p>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-100 px-6 py-3 flex justify-around">
        <button
          onClick={() => navigate("/rider/dashboard")}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 transition"
        >
          <span className="text-lg">🚗</span>
          <span className="text-xs">Dashboard</span>
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex flex-col items-center gap-1 text-gray-900"
        >
          <span className="text-lg">👤</span>
          <span className="text-xs">Profile</span>
        </button>
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 transition"
        >
          <span className="text-lg">🚪</span>
          <span className="text-xs">Sign Out</span>
        </button>
      </div>

      {isEditModalOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
};

export default RiderProfile;
