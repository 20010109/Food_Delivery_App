import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase";

function RiderPendingScreen() {
  const [profile, setProfile] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate("/login");

      const [{ data: rider }, { data: up }] = await Promise.all([
        supabase.from("rider_profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("user_profiles").select("first_name, last_name, profile_image").eq("user_id", user.id).single(),
      ]);

      setProfile(rider);
      setUserProfile(up);

      // Auto-redirect if approved
      if (rider?.verification_status === "approved") {
        navigate("/rider/dashboard");
      }
    };
    fetch();
  }, []);

  const STATUS = {
    pending: {
      icon: "⏳",
      color: "text-yellow-600",
      bg: "bg-yellow-50 border-yellow-200",
      title: "Application Under Review",
      message: "Our team is reviewing your application. This usually takes 1–2 business days.",
    },
    approved: {
      icon: "✅",
      color: "text-green-600",
      bg: "bg-green-50 border-green-200",
      title: "Application Approved!",
      message: "Welcome to the team! You can now start accepting deliveries.",
    },
    denied: {
      icon: "❌",
      color: "text-red-600",
      bg: "bg-red-50 border-red-200",
      title: "Application denied",
      message: "Unfortunately your application was not approved. You may reapply with updated information.",
    },
  };

  const status = profile?.verification_status || "pending";
  const s = STATUS[status];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-5">

        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <img
            src={userProfile?.profile_image || "/default-avatar.png"}
            className="w-14 h-14 rounded-full object-cover bg-gray-200"
          />
          <div>
            <p className="font-semibold text-gray-900">
              {userProfile?.first_name} {userProfile?.last_name}
            </p>
            <p className="text-sm text-gray-400">Rider Applicant</p>
          </div>
        </div>

        {/* Status card */}
        <div className={`rounded-2xl border p-6 space-y-3 ${s.bg}`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{s.icon}</span>
            <h2 className={`text-lg font-bold ${s.color}`}>{s.title}</h2>
          </div>
          <p className="text-sm text-gray-600">{s.message}</p>
        </div>

        {/* Application details */}
        {profile && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Your Application
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-400">Vehicle</span>
                <span className="font-medium capitalize">{profile.vehicle_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Plate Number</span>
                <span className="font-medium">{profile.vehicle_plate_number || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">License</span>
                <span className="font-medium">{profile.license_number || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Submitted</span>
                <span className="font-medium">
                  {new Date(profile.created_at).toLocaleDateString("en-PH", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {status === "approved" && (
            <button
              onClick={() => navigate("/rider/dashboard")}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold"
            >
              Go to Dashboard
            </button>
          )}
          {status === "denied" && (
            <button
              onClick={() => navigate("/rider/onboarding")}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold"
            >
              Reapply
            </button>
          )}
          <button
            onClick={() => navigate("/home")}
            className="w-full text-sm text-gray-400 py-2"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default RiderPendingScreen;