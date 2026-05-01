import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import { useNavigate } from "react-router-dom";

function OnboardingReview() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data } = await supabase
        .from("rider_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setData(data);
    };

    fetch();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow space-y-4">

        <h2 className="text-xl font-bold">Review Your Application</h2>

        {data && (
          <div className="text-sm space-y-2 text-gray-600">
            <p><b>Vehicle:</b> {data.vehicle_type}</p>
            <p><b>Plate:</b> {data.vehicle_plate_number}</p>
            <p><b>Status:</b> {data.verification_status}</p>
          </div>
        )}

        <button
          onClick={() => navigate("/rider/pending")}
          className="w-full bg-red-600 text-white py-3 rounded-xl"
        >
          Submit Application
        </button>
      </div>
    </div>
  );
}

export default OnboardingReview;