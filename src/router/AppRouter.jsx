import React from "react";
import { useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Teams from "../pages/Teams";

export default function AppRouter() {
  const { isAuthenticated } = useSelector(state => state.auth);



  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login/>
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register/>
        } />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />
        } />
        <Route path="/teams" element={
          isAuthenticated ? <Teams /> : <Navigate to="/" replace />
        } />
      </Routes>
    </BrowserRouter>
  );
}
