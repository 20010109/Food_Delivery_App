import React from "react";
import Navbar from './components/Navbar.jsx';
import StoreOwnerDashboard from "./components/StoreOwnerDashboard.jsx";
import './styles/tailwind.css'

function StoreOwnerHomePage() {

  return (
    <div className="flex h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-100 p-8 overflow-auto">
        <StoreOwnerDashboard />
      </main>
    </div>
  );

}

export default StoreOwnerHomePage;

