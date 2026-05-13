import { useNavigate } from "react-router-dom";
import { LuBike, LuClock, LuWallet, LuClipboardList, LuChevronLeft } from "react-icons/lu";

const benefits = [
  {
    icon: <LuClock size={20} className="text-red-500" />,
    title: "Flexible Hours",
    desc: "Work whenever you want, on your own schedule.",
  },
  {
    icon: <LuWallet size={20} className="text-red-500" />,
    title: "Weekly Payouts",
    desc: "Get paid every week directly to your account.",
  },
  {
    icon: <LuClipboardList size={20} className="text-red-500" />,
    title: "Easy Onboarding",
    desc: "Simple application process — done in minutes.",
  },
];

const steps = ["Apply", "Get Verified", "Start Delivering"];

function RiderLandingScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg flex flex-col gap-6">

        {/* Back */}
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition w-fit"
        >
          <LuChevronLeft size={16} />
          Back to Settings
        </button>

        {/* Hero card */}
        <div className="bg-[#0f172a] rounded-3xl p-8 text-white flex flex-col gap-3 shadow-lg">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
            <LuBike size={30} className="text-red-500" />
          </div>
          <h1 className="text-3xl font-bold leading-tight">Become a Rider</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Join our growing fleet and earn money delivering food in your area. Set your own hours and ride on your terms.
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Why join us?</h2>
          <div className="flex flex-col gap-4">
            {benefits.map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide text-center">How it works</h2>
          <div className="flex items-center justify-center">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center gap-2 w-24">
                  <div className="w-10 h-10 rounded-full bg-red-600 text-white text-sm font-bold flex items-center justify-center shadow-sm">
                    {i + 1}
                  </div>
                  <p className="text-xs text-gray-600 font-medium text-center leading-tight">{step}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="h-px w-10 bg-gray-200 mb-5 mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate("/rider/onboarding")}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-semibold text-base transition shadow-md"
        >
          Get Started
        </button>

      </div>
    </div>
  );
}

export default RiderLandingScreen;