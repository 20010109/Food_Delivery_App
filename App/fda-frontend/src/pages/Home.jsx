import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from './components/Navbar.jsx';
import CustomerDashboard from "./components/customerDashboard.jsx";
import './styles/tailwind.css'

function HomePage() {

  return (
      <main className="flex-1 bg-gray-100 p-8 overflow-auto">
        <CustomerDashboard />
      </main>
  );

}

export default HomePage;

