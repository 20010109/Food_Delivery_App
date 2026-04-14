import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase.js";
import { useNavigate } from "react-router-dom";
import "./styles/tailwind.css";
import slide1 from "../assets/slide1.jpg";
import slide2 from "../assets/slide2.jpg";
import slide3 from "../assets/slide3.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex items-center justify-center">
      <div className="flex w-[55%] max-w-[1200px] h-[65%] bg-gray-50 rounded-4xl shadow-lg overflow-hidden flex-col md:flex-row">
  
        {/* LEFT SIDE */}
        <div className="flex-1 p-10 flex flex-col justify-center bg-white">
          <h2 className="text-4xl font-bold mb-2 text-gray-800 text-center">
            Welcome Back!
          </h2>
  
          <p className="mb-5 text-gray-500 text-center pb-6">
            Sign in with your email and password
          </p>
  
          <form onSubmit={handleLogin} className="flex flex-col">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mb-4 p-3 border border-gray-300 rounded-3xl text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
  
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mb-4 p-3 border border-gray-300 rounded-3xl text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
  
            {/* OPTIONS */}
            <div className="flex justify-between text-xs mb-4 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                    remember ? "bg-red-600 border-red-600" : "bg-white border-gray-400"
                  }`}
                >
                  {remember && (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
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
              disabled={loading}
              className="w-full py-3 rounded-full bg-red-600 text-white font-bold text-lg hover:bg-red-800 transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
  
          {/* DIVIDER */}
          <div className="flex items-center my-4">
            <span className="flex-1 h-px bg-gray-400"></span>
            <p className="mx-3 text-xs">or login with</p>
            <span className="flex-1 h-px bg-gray-400"></span>
          </div>
  
          {/* SOCIAL BUTTONS */}
          <div className="flex gap-2">
            <button className="flex-1 py-2 rounded-full bg-white shadow text-sm hover:bg-gray-100 flex flex-row items-center justify-center gap-2">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.84l6.08-6.08C34.46 3.09 29.5 1 24 1 14.82 1 7.07 6.48 3.69 14.18l7.07 5.5C12.5 13.71 17.77 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.52 24.5c0-1.62-.15-3.18-.42-4.68H24v9.02h12.67c-.55 2.93-2.2 5.41-4.68 7.08l7.17 5.57C43.38 37.16 46.52 31.27 46.52 24.5z"/>
                <path fill="#FBBC05" d="M10.76 28.32A14.6 14.6 0 0 1 9.5 24c0-1.5.26-2.95.72-4.32l-7.07-5.5A23.94 23.94 0 0 0 0 24c0 3.87.92 7.53 2.54 10.77l8.22-6.45z"/>
                <path fill="#34A853" d="M24 47c6.48 0 11.92-2.14 15.9-5.83l-7.17-5.57c-2.15 1.45-4.9 2.3-8.73 2.3-6.23 0-11.5-4.21-13.24-9.88l-8.22 6.45C7.07 41.52 14.82 47 24 47z"/>
              </svg>
              <span>Google</span>
            </button>
            <button className="flex-1 py-2 rounded-full bg-white shadow text-sm hover:bg-gray-100 flex flex-row items-center justify-center gap-2">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </button>
            <button className="flex-1 py-2 rounded-full bg-white shadow text-sm hover:bg-gray-100 flex flex-row items-center justify-center gap-2">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span>Apple</span>
            </button>
          </div>
  
          {/* REGISTER */}
          <p className="text-xs text-center mt-4">
            Don’t have an account?{" "}
            <span
              className="text-red-500 cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              Register Now
            </span>
          </p>
        </div>
  
        {/* RIGHT SIDE */}
        <div className="flex-1 relative bg-gray-200 overflow-hidden">
          <div
            className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
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
                className={`w-3 h-3 rounded-full cursor-pointer ${
                  i === currentSlide ? "bg-red-600" : "bg-gray-400"
                }`}
                onClick={() => setCurrentSlide(i)}
              ></span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}