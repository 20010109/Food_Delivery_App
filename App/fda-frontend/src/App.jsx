import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx"
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/dashboard.jsx"
import LandingPage from "./pages/LandingPage.jsx"

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />}/>
    </Routes>
  );
}

export default App
