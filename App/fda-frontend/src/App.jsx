import { Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/dashboard.jsx"

function App() {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />}/>
    </Routes>
  );
}

export default App
