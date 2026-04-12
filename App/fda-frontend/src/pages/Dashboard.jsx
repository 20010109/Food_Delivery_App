import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignupPage() {
  const [text, setText] = useState("");

  return (
    <section>
      <div>
        <h1>WELCOME TO THE DASHBOARD!</h1>
      </div>
    </section>
  );
}

export default SignupPage;