import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Home from "./pages/Home.jsx";
import ExplorePage from "./pages/ExplorePage.jsx";
import Favourites from "./pages/Favourites.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import StorePage from "./pages/StorePage.jsx";
import ProfilePage from "./pages/Profile.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import UserSetup from "./pages/UserSetup.jsx";
import CreateMenuItem from "./pages/CreateMenuItem.jsx"
import StoreOwnerHome from "./pages/StoreOwnerHomePage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import Messages from "./pages/Messages.jsx";
import BannedPage from "./pages/BannedPage.jsx";

import AdminHomePage from "./pages/admin/AdminHomePage.jsx";
import AdminRestaurantsPage from "./pages/Admin/AdminRestaurantsPage.jsx"
import AdminUsersPage from "./pages/Admin/AdminUsersPage.jsx"
import AdminAnalyticsPage from "./pages/Admin/AdminAnalyticsPage.jsx";
import AdminRidersPage from "./pages/Admin/AdminRidersPage.jsx";
// ✅ NEW
import CheckoutPage from "./pages/CheckoutPage.jsx";
// ✅ RIDER
import RiderDashboard from "./pages/Rider/RiderDashboard.jsx";
import RiderLandingScreen from "./pages/Rider/RiderLandingScreen.jsx";
import RiderOnboarding from "./pages/Rider/RiderOnboarding.jsx";
import OnboardingReview from "./pages/Rider/RiderOnboardingReview.jsx";



function App() {
  return (
    <Routes>

      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/banned" element={<BannedPage />} />

      {/* User Setup */}
      <Route path="/usersetup" element={<UserSetup />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>

        {/* ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminHomePage />} />
          <Route path="/admin/restaurants" element={<AdminRestaurantsPage />} />
          <Route path="/admin/riders" element={<AdminRidersPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        </Route>


        {/* Customer */}
        <Route path="/home" element={<Home />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/favourites" element={<Favourites />} />
        <Route path="/store/:id" element={<StorePage />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />

        {/* Store Owner */}
        <Route path="/storeowner/home" element={<StoreOwnerHome />} />
        <Route
          path="/myrestaurant/:restaurantId/createmenuitem"
          element={<CreateMenuItem />}
        />

        {/* Rider */}
        <Route path="/rider" element={<RiderLandingScreen />} />
        <Route path="/rider/onboarding" element={<RiderOnboarding />} />
        <Route path="/rider/review" element={<OnboardingReview />} />

        <Route element={<ProtectedRoute allowedRoles={["rider"]} />}>
          <Route path="/rider/dashboard" element={<RiderDashboard />} />
        </Route>

        {/* Settings */}
        <Route path="/settings" element={<SettingsPage />} />

      </Route>

    </Routes>
  );
}

export default App;