import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase.js";
import slide1 from "../assets/slide1.jpg";
import slide2 from "../assets/slide2.jpg";
import slide3 from "../assets/slide3.jpg";

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const navigate = useNavigate();
  const slides = [slide1, slide2, slide3];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      alert("Signup successful! You can now log in.");
      navigate("/login");

    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col md:flex-row bg-white rounded-4xl shadow-lg overflow-hidden w-[90%] max-w-4xl h-[1000px] md:h-[600px]">
        
        {/* LEFT SIDE */}
        <div className="flex-1 p-8 flex flex-col gap-4 justify-center">
          <h2 className="text-4xl font-bold text-center">Create an account</h2>
          <p className="text-sm text-gray-500 text-center -mt-2">
            Sign up with your email and password
          </p>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
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
              minLength={8}
              className="border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            <button
              type="submit"
              disabled={isLoading}
              className={`bg-red-600 text-white rounded-full py-2 font-semibold hover:bg-red-700 transition ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </button>

            <p className="text-xs text-center text-gray-500">
              Already have an account?{" "}
              <span
                className="text-red-500 cursor-pointer"
                onClick={() => navigate("/login")}
              >
                Login
              </span>
            </p>
          </form>
        </div>

        {/* RIGHT SIDE (SLIDER - UNCHANGED) */}
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

export default SignupPage;