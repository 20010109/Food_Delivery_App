// pages/Signup.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "./auth.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle signup logic
    console.log(formData);
    navigate('/home');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-left">
          <h2>Create an account</h2>
          <p>Sign up with your email and password</p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="submit">Sign Up</button>
          </form>
          <p>
            Already have an account? <Link to="/login">Login here</Link>
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
};

export default Signup;