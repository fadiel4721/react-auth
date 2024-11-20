//src/layout/MainLayout.jsx
import { Outlet } from "react-router-dom";  

import Navbar from "../components/Navbar";

import { ThemeProvider } from "../context/ThemeContext";

export default function MainLayout() {
 
  return (
    <ThemeProvider>
      <Navbar />
      <Outlet />
    </ThemeProvider>
  );
}
