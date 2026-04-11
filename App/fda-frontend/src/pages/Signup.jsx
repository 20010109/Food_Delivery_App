import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase.js";

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const navigate = useNavigate();

  const createProfile = async (userId, accessToken) => {
    const response = await fetch("http://localhost:3000/api/auth/profile", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: fullName,
        contact_number: contactNumber,
        role: "customer",
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create profile");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Supabase signup error:", error);
      alert(error.message);
      return;
    }

    if (!data.user) {
      alert("Check your email for a confirmation link before signing in.");
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      alert("No session found. Please verify your email and log in.");
      return;
    }

    try {
      await createProfile(data.user.id, sessionData.session.access_token);
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Contact Number"
          value={contactNumber}
          onChange={e => setContactNumber(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
    </section>
  );
}

export default SignupPage;