import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase.js";
import "./styles/Signup.css";
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


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    },3000);
      return () => clearInterval(timer);
  },[]);

  
  const createProfile = async (accessToken) => {
    const response = await fetch("http://localhost:3000/api/auth/createProfile",{
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
    },

    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      contact_number: contactNumber,
      role: "customer",
    }),
  });

  if(!response.ok){
    const error = await response.json();
    throw new Error(error.message || "Failed to create user profile");
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
      try {
        await createProfile(accessToken);
        navigate("/login"); 
      }catch (err) {
        alert(err.message);
      }
    
    };

  return (
    <div className="signup-wrapper">
      <div className="signup-card">


        
        <div className="signup-left">
          <h2 className = "signup-title">Create an account</h2>
          <p className="signup-subtitle">Sign up with your email and password</p>

          {step === 1 && (
            <form onSubmit={handleStep1} className="signup-form">
              <input className = "signup-input"
                type = "email"
                placeholder = "Email"
                value = {email}
                onChange = {(e) => setEmail(e.target.value)}
                required
                />

              <input className = "signup-input"
                type = "password"
                placeholder = "Password"
                value = {password}
                onChange = {(e) => setPassword(e.target.value)}
                required
                minLength = {8}
                />
                
                <button type="submit" className = "signup-button">Next</button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2} className = "signup-form">
              <input className = "signup-input"
                type = "text"
                placeholder = "First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />

              <input className = "signup-input"
                type = "text"
                placeholder = "Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />

              <input className = "signup-input"
                type= "text"
                placeholder = "Contact Number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                required
              />
              <button type="submit" className = "signup-button">Sign Up</button>
            </form>
          )}
        </div>

        <div className = "signup-right">
          <img src={slides[currentSlide]} alt = "slide" />
          <div className="signup-dots">
            {slides.map((_, i) => (
              <span
                key={i}
                className={i === currentSlide ? "dot-red" : "dot-blue"}
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


    