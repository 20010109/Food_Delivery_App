import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx"
import Signup from "./pages/Signup.jsx";
import Home from "./pages/Home.jsx"
import LandingPage from "./pages/LandingPage.jsx"
import StorePage from "./pages/StorePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />}/>
      <Route path="/store/:id" element={<StorePage />} />
    </Routes>
  );
}

export default App
