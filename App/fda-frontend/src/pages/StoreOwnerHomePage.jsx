import { useState } from "react";
import StoreOwnerSidebar from "./components/StoreOwner/StoreOwnerSidebar.jsx";
import StoreOwnerDashboard from "./components/StoreOwner/StoreOwnerDashboard.jsx";

function StoreOwnerHomePage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <StoreOwnerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <StoreOwnerDashboard activeTab={activeTab} />
      </div>
    </div>
  );
}

export default StoreOwnerHomePage;


