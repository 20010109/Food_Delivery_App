import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase.js";

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const createProfile = async (user) => {
    const { data } = await supabase.auth.getSession();

    await fetch("http://localhost:3000/api/auth/profile", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "customer",
      }),
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      await createProfile(data.user);
      navigate("/dashboard");
    }
  };

  return (
    <section>
      <form onSubmit={handleSignup}>
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