import { Routes, Route } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products"; // Import halaman Products
import Register from "../pages/Register";
import Login from "../pages/Login";
import React from "react";
import OrderItem from "../pages/OrderItem";
import OrderHistory from "../pages/History"; // Pastikan path file sesuai
import LoyaltyPage from "../pages/Loyalty";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Route untuk login page */}
      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />
      {/* Route untuk layout utama */}
      <Route path="/" element={<MainLayout />}>
        {/* Halaman di bawah layout utama */}
        <Route path="/home" element={<Dashboard />} />
        <Route path="/products" element={<Products />} /> 
        <Route path="/order-item" element={<OrderItem />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/loyalty" element={<LoyaltyPage />} />
      </Route>
    </Routes>
  );
}
