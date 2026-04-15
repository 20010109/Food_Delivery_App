import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Home from "./pages/Home.jsx";
import ExplorePage from "./pages/ExplorePage.jsx";
import Favourites from "./pages/Favourites.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import StorePage from "./pages/StorePage.jsx";
import ProfilePage from "./pages/Profile.jsx";
import RestaurantRegistration from "./pages/RestaurantRegis.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Customer */}
      <Route path="/home" element={<Home />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/favourites" element={<Favourites />} />
      <Route path="/store/:id" element={<StorePage />} />

      {/* ORDERS PAGE (RESTORED) */}
      <Route path="/orders" element={<OrdersPage />} />

      {/* Other */}
      <Route path="/profile/:id" element={<ProfilePage />} />
      <Route path="/restaurantregis" element={<RestaurantRegistration />} />
    </Routes>
  );
}

export default App;