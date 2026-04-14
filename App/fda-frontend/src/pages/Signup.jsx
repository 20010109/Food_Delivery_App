import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase.js";
import slide1 from "../assets/slide1.jpg";
import slide2 from "../assets/slide2.jpg";
import slide3 from "../assets/slide3.jpg";


function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [step, setStep] = useState(1);
  const [accessToken, setAccessToken] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const otpRefs = useRef([]);
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [slide1,slide2,slide3];
  const [areaCode, setAreaCode] = useState("+63");
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const areaCodes = [
    { code: "+1",   label: "+1 (US/CA)" },
    { code: "+44",  label: "+44 (GB)" },
    { code: "+61",  label: "+61 (AU)" },
    { code: "+81",  label: "+81 (JP)" },
    { code: "+49",  label: "+49 (DE)" },
    { code: "+33",  label: "+33 (FR)" },
    { code: "+91",  label: "+91 (IN)" },
    { code: "+86",  label: "+86 (CN)" },
    { code: "+63",  label: "+63 (PH)" },
    { code: "+971", label: "+971 (AE)" },
    { code: "+234", label: "+234 (NG)" },
    { code: "+27",  label: "+27 (ZA)" },
    { code: "+55",  label: "+55 (BR)" },
    { code: "+7",   label: "+7 (RU)" },
    { code: "+82",  label: "+82 (KR)" },
    { code: "+34",  label: "+34 (ES)" },
    { code: "+39",  label: "+39 (IT)" },
    { code: "+62",  label: "+62 (ID)" },
    { code: "+92",  label: "+92 (PK)" },
    { code: "+20",  label: "+20 (EG)" },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    },5000);
      return () => clearInterval(timer);
  },[]);

  
  const createProfile = async (accessToken, fullContactNumber) => {
    if (!accessToken) {
      throw new Error("No access token provided");
    }
    const profileData = {
      first_name: firstName,
      last_name: lastName,
      contact_number: fullContactNumber,
      role: "customer",
    };
    try {
      const response = await fetch("http://localhost:3000/api/users/profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(profileData),
      });
  
      const responseBody = await response.json();
      if (!response.ok) {
        console.error("Profile creation failed:", response.status, responseBody);
        throw new Error(responseBody.message || "Failed to create user profile");
      }
      return responseBody;
    } catch (err) {
      console.error("Network or server error:", err);
      throw err;
    }
  };

  const handleStep1 = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        console.error("Signup error:", error);
        alert(error.message);
        return;
      }
      if (!data.user) {
        alert("Signup failed. Please try again.");
        return;
      }
      // Move to OTP step — Supabase sends a confirmation code to the email
      // TODO: re-enable OTP (setStep(2)) once email verification is configured
      if (data.session) {
        setAccessToken(data.session.access_token);
      }
      setStep(2);
    } catch (err) {
      console.error("Unexpected error during signup:", err);
      alert("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp.join(""),
        type: "signup",
      });
      if (error) {
        console.error("OTP error:", error);
        alert(error.message);
        return;
      }
      if (!data.session) {
        alert("Verification failed. Please try again.");
        return;
      }
      setAccessToken(data.session.access_token);
      setStep(3);
    } catch (err) {
      console.error("Unexpected error during OTP verification:", err);
      alert("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3 = async (e) => {
    e.preventDefault();
    const fullContactNumber = `${areaCode}${contactNumber}`;
    setIsLoading(true);
    try {
      await createProfile(accessToken, fullContactNumber);
      navigate("/login");
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col md:flex-row bg-white rounded-4xl shadow-lg overflow-hidden w-[90%] max-w-4xl h-[1000px] md:h-[600px]">
        {/* Left Side */}
        <div className="flex-1 p-8 flex flex-col gap-4 justify-center ">
          <h2 className="text-4xl font-bold text-center mb-2">Create an account</h2>
          <p className="text-sm text-gray-500 text-center -mt-4">
            {step === 1 && "Sign up with your email and password"}
            {step === 2 && `Enter the verification code sent to ${email}`}
            {step === 3 && "Fill in your personal information"}
          </p>

          {step === 1 && (
            <form onSubmit={handleStep1} className="flex flex-col gap-4">
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
                className={`bg-red-600 text-white rounded-full py-2 font-semibold hover:bg-red-700 transition ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Next"}
              </button>
              <p className="text-xs text-center text-gray-500">
                Already have an account?{" "}
                <span className="text-red-500 cursor-pointer" onClick={() => navigate("/login")}>
                  Login
                </span>
              </p>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2} className="flex flex-col gap-4">
              <div className="flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (!val) return;
                      const newOtp = [...otp];
                      newOtp[i] = val;
                      setOtp(newOtp);
                      if (i < 5) otpRefs.current[i + 1]?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace") {
                        const newOtp = [...otp];
                        if (otp[i]) {
                          newOtp[i] = "";
                          setOtp(newOtp);
                        } else if (i > 0) {
                          newOtp[i - 1] = "";
                          setOtp(newOtp);
                          otpRefs.current[i - 1]?.focus();
                        }
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                      const newOtp = Array(6).fill("");
                      pasted.split("").forEach((ch, idx) => { newOtp[idx] = ch; });
                      setOtp(newOtp);
                      otpRefs.current[Math.min(pasted.length, 5)]?.focus();
                    }}
                    className="w-11 h-12 border-2 border-gray-300 rounded-xl text-center text-lg font-semibold focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-300"
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 text-center">
                Didn't receive the code?{" "}
                <span
                  className="text-red-500 cursor-pointer"
                  onClick={async () => {
                    await supabase.auth.resend({ type: "signup", email });
                    alert("Verification code resent!");
                  }}
                >
                  Resend
                </span>
              </p>
              <button
                type="submit"
                className={`bg-red-600 text-white rounded-full py-2 font-semibold hover:bg-red-700 transition ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify"}
              </button>
              <button
                type="button"
                className="text-sm text-gray-400 hover:text-gray-600"
                onClick={() => { setStep(1); setOtp(Array(6).fill("")); }}
              >
                ← Back
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleStep3} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
    <div className="flex gap-2">
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 whitespace-nowrap"
        >
          {areaCode}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            />
          </svg>
        </button>

        {dropdownOpen && (
          <ul className="absolute z-50 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
            {areaCodes.map(({ code, label }) => (
              <li
                key={code}
                onClick={() => { setAreaCode(code); setDropdownOpen(false); }}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-red-50 hover:text-red-600 ${
                  areaCode === code ? "bg-red-50 text-red-600 font-semibold" : "text-gray-700"
                }`}
              >
                {label}
              </li>
            ))}
          </ul>
        )}
      </div>
       

  <input
    type="text"
    placeholder="Contact Number"
    value={contactNumber}
    onChange={(e) => setContactNumber(e.target.value)}
    required
    className="border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-left w-full"
  />
</div>
              <button
                type="submit"
                className={`bg-red-600 text-white rounded-full py-2 font-semibold hover:bg-red-700 transition ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Sign Up"}
              </button>
            </form>
          )}
        </div>

        {/* Right Side */}
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
          i === currentSlide ? "bg-red-600" : "bg-gray-500"
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

export default SignupPage;


