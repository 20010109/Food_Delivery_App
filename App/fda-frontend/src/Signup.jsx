import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'


function SignupPage() {
    //OPTIONAL IF CREATE PROFILE DURING SIGNUP
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

    const handleSignup = async () => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
      
        if (error) {
          alert(error.message);
        } else {
          // OPTIONAL: call backend to create profile
          await createProfile(data.user);
      
          navigate("/dashboard");
        }
      };

  return (
    <>
      

      
    </>
  )
}

export default App
