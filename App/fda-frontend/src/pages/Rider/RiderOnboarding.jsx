import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase";
import { LuBike, LuChevronLeft, LuHash, LuIdCard, LuFileText } from "react-icons/lu";

function RiderOnboarding() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [vehicleType, setVehicleType] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [orCode, setOrCode] = useState("");
  const [crCode, setCrCode] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (!error) setProfile(data);
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("rider_profiles")
      .insert({
        user_id: user.id,
        vehicle_type: vehicleType,
        vehicle_plate_number: plateNumber,
        license_number: licenseNumber,
        or_code: orCode,
        cr_code: crCode,
        verification_status: "pending",
        availability_status: "offline"
      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/rider/review");
  };

  const vehicleOptions = [
    { value: "bike", label: "Bike" },
    { value: "motorcycle", label: "Motorcycle" },
    { value: "car", label: "Car" },
    { value: "bicycle", label: "Bicycle" },
  ];

  const fields = [
    { label: "Plate Number", value: plateNumber, onChange: setPlateNumber, icon: <LuHash size={16} />, placeholder: "e.g. ABC 1234" },
    { label: "License Number", value: licenseNumber, onChange: setLicenseNumber, icon: <LuIdCard size={16} />, placeholder: "e.g. N01-23-456789" },
    { label: "OR Code", value: orCode, onChange: setOrCode, icon: <LuFileText size={16} />, placeholder: "Official Receipt code" },
    { label: "CR Code", value: crCode, onChange: setCrCode, icon: <LuFileText size={16} />, placeholder: "Certificate of Registration code" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg flex flex-col gap-5">

        {/* Back */}
        <button
          onClick={() => navigate("/rider")}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition w-fit"
        >
          <LuChevronLeft size={16} />
          Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <LuBike size={24} className="text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Rider Application</h1>
            {profile && (
              <p className="text-sm text-gray-400 mt-0.5">
                Applying as <span className="font-medium text-gray-600">{profile.first_name} {profile.last_name}</span>
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Vehicle Type */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Vehicle</h2>
            <div className="grid grid-cols-2 gap-2">
              {vehicleOptions.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setVehicleType(value)}
                  className={`py-3 rounded-2xl text-sm font-semibold border-2 transition ${
                    vehicleType === value
                      ? "border-red-600 bg-red-50 text-red-600"
                      : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* hidden required input to enforce selection */}
            <input type="text" required value={vehicleType} onChange={() => {}} className="sr-only" />
          </div>

          {/* Document Fields */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Documents</h2>
            {fields.map(({ label, value, onChange, icon, placeholder }) => (
              <div key={label} className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500">{label}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
                  <input
                    required
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 bg-gray-50"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-semibold text-base transition shadow-md ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>

      </div>
    </div>
  );
}

export default RiderOnboarding;