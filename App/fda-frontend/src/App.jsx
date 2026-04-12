import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/dashboard.jsx";
import Login from "./pages/Login.jsx";
import './pages/auth.css';
function App() {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />}/>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App
