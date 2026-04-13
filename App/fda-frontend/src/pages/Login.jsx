import { useState } from "react";
import { supabase } from "../utils/supabase.js";
import { useNavigate } from "react-router-dom";
import "./styles/tailwind.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    <div className="h-screen bg-white flex items-center justify-center">
      <div className="flex w-[80%] max-w-[1200px] h-[80%] bg-gray-50 rounded-2xl shadow-md overflow-hidden flex-col md:flex-row">
  
        {/* LEFT SIDE */}
        <div className="flex-1 p-10 flex flex-col justify-center bg-white">
          <h2 className="text-4xl font-bold mb-2 text-gray-800">
            Welcome Back!
          </h2>
  
          <p className="mb-5 text-gray-500">
            Sign in with your email and password
          </p>
  
          <form onSubmit={handleLogin} className="flex flex-col">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mb-4 p-3 border border-gray-300 rounded-xl text-base"
            />
  
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mb-4 p-3 border border-gray-300 rounded-xl text-base"
            />
  
            {/* OPTIONS */}
            <div className="flex justify-between text-xs mb-4">
              <label className="flex items-center gap-2">
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
          <button className="w-full py-2 mb-2 rounded-full bg-white shadow text-sm hover:bg-gray-100">
            Google
          </button>
          <button className="w-full py-2 mb-2 rounded-full bg-white shadow text-sm hover:bg-gray-100">
            Facebook
          </button>
          <button className="w-full py-2 mb-2 rounded-full bg-white shadow text-sm hover:bg-gray-100">
            Apple
          </button>
  
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
        <div className="flex-1 flex flex-col justify-center items-center bg-gray-100 p-5 rounded-2xl">
          <p>CAROUSEL</p>
  
          <div className="flex justify-center mt-auto mb-5">
            <span className="w-3 h-3 mx-2 bg-red-600 rounded-full"></span>
            <span className="w-3 h-3 mx-2 bg-gray-300 rounded-full"></span>
            <span className="w-3 h-3 mx-2 bg-gray-300 rounded-full"></span>
          </div>
        </div>
  
      </div>
    </div>
  );
}