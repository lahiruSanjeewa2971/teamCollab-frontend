import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";

export default function AppRouter() {
  const dispatch = useDispatch();
  const {isAuthenticated, isLoading} = useSelector(state => state.auth);



  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={
            // isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login/>
            <Login/>
        } />

        {/* Protected routes */}
      </Routes>
    </BrowserRouter>
  );
}
