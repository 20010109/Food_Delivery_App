import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase.js";
import { useNavigate } from "react-router-dom";
import slide1 from "../assets/slide1.jpg";
import slide2 from "../assets/slide2.jpg";
import slide3 from "../assets/slide3.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [slide1, slide2, slide3];
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      const user = data.user;

      if (!user?.email_confirmed_at) {
        alert("Please verify your email first.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // If no profile yet
      if (profileError || !profile) {
        navigate("/usersetup");
        return;
      }

      // ROLE-BASED REDIRECT
      switch (profile.role) {
        case "admin":
          navigate("/admin");
          break;

        case "storeowner":
          navigate("/storeowner/home");
          break;

        case "rider":
          navigate("/rider/home");
          break;

        case "customer":
        default:
          navigate("/home");
          break;
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col md:flex-row bg-white rounded-4xl shadow-lg overflow-hidden w-[90%] max-w-4xl h-[1000px] md:h-[600px]">

        {/* LEFT SIDE */}
        <div className="flex-1 p-8 flex flex-col gap-4 justify-center">
          <h2 className="text-4xl font-bold text-center">Welcome Back</h2>

          <p className="text-sm text-gray-500 text-center -mt-2">
            Login with your email and password
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            {/* OPTIONS */}
            <div className="flex justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>

              <span
                className="text-red-500 cursor-pointer"
                onClick={() => navigate("/reset-password")}
              >
                Forgot password?
              </span>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-red-600 text-white rounded-full py-2 font-semibold hover:bg-red-700 transition ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

          </form>

          {/* DIVIDER */}
          <div className="flex items-center">
            <span className="flex-1 h-px bg-gray-300"></span>
            <p className="mx-3 text-xs text-gray-400">or continue with</p>
            <span className="flex-1 h-px bg-gray-300"></span>
          </div>

          {/* SOCIAL BUTTONS */}
          <div className="flex gap-2">
            <button className="flex-1 py-2 rounded-full bg-white shadow text-sm hover:bg-gray-100">
              Google
            </button>

            <button className="flex-1 py-2 rounded-full bg-white shadow text-sm hover:bg-gray-100">
              Facebook
            </button>

            <button className="flex-1 py-2 rounded-full bg-white shadow text-sm hover:bg-gray-100">
              Apple
            </button>
          </div>

          {/* REGISTER */}
          <p className="text-xs text-center text-gray-500">
            Don’t have an account?{" "}
            <span
              className="text-red-500 cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              Register
            </span>
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 relative bg-gray-200 overflow-hidden">
          <div
            className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            {slides.map((slide, index) => (
              <img
                key={index}
                src={slide}
                alt={`slide-${index}`}
                className="w-full h-full object-cover flex-shrink-0"
              />
            ))}
          </div>

          <div className="absolute bottom-4 flex gap-2 justify-center w-full">
            {slides.map((_, i) => (
              <span
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-3 h-3 rounded-full cursor-pointer ${
                  i === currentSlide ? "bg-red-600" : "bg-gray-500"
                }`}
              ></span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}