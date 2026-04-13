import { useState, useEffect } from "react";
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
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [slide1,slide2,slide3];

  const [areaCode, setAreaCode] = useState("+63");


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

      if(password.length < 8){
        alert("Password must be at least 8 characters long.");
        return;
      }

    
      const { data, error } = await supabase.auth.signUp({email,password});

      if (error) {
        alert(error.message);
        return;
      }

      if (!data.user){
        alert("Please check your email for a confirmation link before signing in.");
        return;
      }

      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session){
        alert("No session found. Please check your email and log in.");
        return;
      }

      setAccessToken(sessionData.session.access_token);
      setStep(2);
    }

  const handleStep2 = async (e) => {
      e.preventDefault();
      const fullContactNumber = `${areaCode}${contactNumber}`;
      try {
        await createProfile(accessToken, fullContactNumber);
        navigate("/login"); 
      }catch (err) {
        alert(err.message);
      }
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-lg overflow-hidden w-[90%] max-w-4xl h-[1000px] md:h-[600px]">
        {/* Left Side */}
        <div className="flex-1 p-8 flex flex-col gap-4 justify-center ">
          <h2 className="text-2xl font-bold text-center">Create an account</h2>
          <p className="text-sm text-gray-500 text-center -mt-2">Sign up with your email and password</p>

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
                className="bg-red-600 text-white rounded-full py-2 font-semibold hover:bg-red-700 transition"
              >
                Next
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2} className="flex flex-col gap-4">
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
                <select
                  value={areaCode}
                  onChange={e => setAreaCode(e.target.value)}
                  className="border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="+1">+1 (US/CA)</option>
                  <option value="+44">+44 (GB)</option>
                  <option value="+61">+61 (AU)</option>
                  <option value="+81">+81 (JP)</option>
                  <option value="+49">+49 (DE)</option>
                  <option value="+33">+33 (FR)</option>
                  <option value="+91">+91 (IN)</option>
                  <option value="+86">+86 (CN)</option>
                  <option value="+63">+63 (PH)</option>
                  <option value="+971">+971 (AE)</option>
                  <option value="+234">+234 (NG)</option>
                  <option value="+27">+27 (ZA)</option>
                  <option value="+55">+55 (BR)</option>
                  <option value="+7">+7 (RU)</option>
                  <option value="+82">+82 (KR)</option>
                  <option value="+34">+34 (ES)</option>
                  <option value="+39">+39 (IT)</option>
                  <option value="+62">+62 (ID)</option>
                  <option value="+92">+92 (PK)</option>
                  <option value="+20">+20 (EG)</option>
                  {/* Add more area codes as needed */}
                </select>
                <input
                  type="text"
                  placeholder="Contact Number"
                  value={contactNumber}
                  onChange={e => setContactNumber(e.target.value)}
                  required
                  className="border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <button
                type="submit"
                className="bg-red-600 text-white rounded-full py-2 font-semibold hover:bg-red-700 transition"
              >
                Sign Up
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
          i === currentSlide ? "bg-red-600" : "bg-blue-500"
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


