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

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState("");

  // OAuth loading state (tracks which provider is loading)
  const [oauthLoading, setOauthLoading] = useState(null);

  const slides = [slide1, slide2, slide3];
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeForgotModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ─── Handlers ────────────────────────────────────────────────

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

      if (profileError || !profile) {
        navigate("/usersetup");
        return;
      }

      // 🚫 ADD THIS BAN CHECK
      if (profile.is_active === false) {
        await supabase.auth.signOut();
        navigate("/banned");
        return;
      }

      switch (profile.role) {
        case "admin":
          navigate("/admin");
          break;
        case "storeowner":
          navigate("/home");
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

  // ─── OAuth ───────────────────────────────────────────────────

  const handleOAuth = async (provider) => {
    setOauthLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          // After OAuth, Supabase redirects here — adjust to your app's URL
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        alert(`${provider} login failed: ${error.message}`);
      }
      // On success Supabase redirects the browser automatically,
      // so no navigate() call is needed here.
    } catch (err) {
      console.error(err);
      alert("OAuth sign-in failed. Please try again.");
    } finally {
      setOauthLoading(null);
    }
  };

  // ─── Forgot Password ─────────────────────────────────────────

  const openForgotModal = () => {
    setResetEmail(email); // pre-fill with whatever is in the login field
    setResetSent(false);
    setResetError("");
    setShowForgotModal(true);
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setResetEmail("");
    setResetSent(false);
    setResetError("");
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        // Supabase will append ?type=recovery&token=... to this URL
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setResetError(error.message);
      } else {
        setResetSent(true);
      }
    } catch (err) {
      console.error(err);
      setResetError("Something went wrong. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────

  return (
    <>
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
                  className="text-red-500 cursor-pointer hover:underline"
                  onClick={openForgotModal}
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
              <button
                onClick={() => handleOAuth("google")}
                disabled={oauthLoading !== null}
                className="flex-1 py-2 rounded-full bg-white shadow text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {oauthLoading === "google" ? "..." : "Google"}
              </button>

              <button
                onClick={() => handleOAuth("facebook")}
                disabled={oauthLoading !== null}
                className="flex-1 py-2 rounded-full bg-white shadow text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {oauthLoading === "facebook" ? "..." : "Facebook"}
              </button>

              <button
                onClick={() => handleOAuth("apple")}
                disabled={oauthLoading !== null}
                className="flex-1 py-2 rounded-full bg-white shadow text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {oauthLoading === "apple" ? "..." : "Apple"}
              </button>
            </div>

            {/* REGISTER */}
            <p className="text-xs text-center text-gray-500">
              Don't have an account?{" "}
              <span
                className="text-red-500 cursor-pointer hover:underline"
                onClick={() => navigate("/signup")}
              >
                Register
              </span>
            </p>
          </div>

          {/* RIGHT SIDE — slideshow */}
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
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ─── FORGOT PASSWORD MODAL ─────────────────────────────── */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) closeForgotModal(); }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-sm flex flex-col gap-4">

            {resetSent ? (
              /* ── Success state ── */
              <>
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-2xl">
                    ✓
                  </div>
                  <h3 className="text-xl font-bold">Check your email</h3>
                  <p className="text-sm text-gray-500">
                    We sent a password reset link to{" "}
                    <span className="font-medium text-gray-700">{resetEmail}</span>.
                    It may take a minute to arrive.
                  </p>
                </div>
                <button
                  onClick={closeForgotModal}
                  className="mt-2 bg-red-600 text-white rounded-full py-2 font-semibold hover:bg-red-700 transition"
                >
                  Back to Login
                </button>
              </>
            ) : (
              /* ── Form state ── */
              <>
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-bold">Forgot password?</h3>
                  <p className="text-sm text-gray-500">
                    Enter your email and we'll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder="Email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />

                  {resetError && (
                    <p className="text-red-500 text-xs px-1">{resetError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className={`bg-red-600 text-white rounded-full py-2 font-semibold hover:bg-red-700 transition text-sm ${
                      resetLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {resetLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>

                <button
                  onClick={closeForgotModal}
                  className="text-xs text-gray-400 hover:text-gray-600 text-center"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}