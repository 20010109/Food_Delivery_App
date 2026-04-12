import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log(email, password, remember);
    // connect to backend later
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-left">
          <h2>Welcome Back!</h2>
          <p>Sign In with your email and password</p>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="remember-me">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label>Remember me on this device for 30 days</label>
            </div>
            <button type="submit">Login</button>
          </form>
          <p>
            Forgot your password? <a href="/reset-password">Reset it here</a>
          </p>
          <p>or login with</p>
          <button className="google-login">Login with Google</button>
          <button className="facebook-login">Login with Facebook</button>
          <button className="apple-login">Login with Apple</button>
          <p>
            Don’t have an account? <a href="/signup">Register Now</a>
          </p>
        </div>
        <div className="auth-right">
          <p>CAROUSEL</p>
          <div className="carousel-indicators">
            <span className="indicator active"></span>
            <span className="indicator"></span>
            <span className="indicator"></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;