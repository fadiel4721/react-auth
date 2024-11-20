import React from "react";

// import react router dom
import { Routes, Route } from "react-router-dom";

// import component Register
import Register from "./pages/Register";

// import component Login
import Login from "./pages/Login";

// import component Dashboard
import Dashboard from "./pages/Dashboard";


function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Dashboard />} />
     
      </Routes>
    </div>
  );
}

export default App;