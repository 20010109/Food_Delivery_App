import { useNavigate } from "react-router-dom";

function RiderLandingScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 flex flex-col gap-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">Become a Rider</h1>
          <p className="text-gray-500 text-sm mt-2">
            Earn money delivering food in your area
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-2 text-sm text-gray-600">
          <p>✔ Flexible working hours</p>
          <p>✔ Weekly payouts</p>
          <p>✔ Easy onboarding</p>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate("/rider/onboarding")}
          className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold"
        >
          Get Started
        </button>

        <button
          onClick={() => navigate("/home")}
          className="text-sm text-gray-500"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default RiderLandingScreen;