import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase";

function RiderOnboarding() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [vehicleType, setVehicleType] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [orCode, setOrCode] = useState("");
  const [crCode, setCrCode] = useState("");

  // fetch user profile
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

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded-2xl shadow space-y-4"
      >
        <h2 className="text-xl font-bold">Rider Application</h2>

        {profile && (
          <p className="text-sm text-gray-500">
            Applying as: {profile.first_name} {profile.last_name}
          </p>
        )}

        <select
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
          className="w-full border p-3 rounded-xl"
          required
        >
          <option value="">Vehicle Type</option>
          <option value="bike">Bike</option>
          <option value="motorcycle">Motorcycle</option>
          <option value="car">Car</option>
          <option value="bicycle">Bicycle</option>
        </select>

        <input
          placeholder="Plate Number"
          value={plateNumber}
          onChange={(e) => setPlateNumber(e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <input
          placeholder="License Number"
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <input
          placeholder="OR Code"
          value={orCode}
          onChange={(e) => setOrCode(e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <input
          placeholder="CR Code"
          value={crCode}
          onChange={(e) => setCrCode(e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <button
          disabled={loading}
          className="w-full bg-red-600 text-white py-3 rounded-xl"
        >
          {loading ? "Submitting..." : "Continue"}
        </button>
      </form>
    </div>
  );
}

export default RiderOnboarding;