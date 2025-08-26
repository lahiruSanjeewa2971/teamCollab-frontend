import React from "react";
import { useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Teams from "../pages/Teams";
import TeamManage from "../pages/TeamManage";
import Channels from "../pages/Channels";
import ChannelScreen from "../pages/ChannelScreen";

export default function AppRouter() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            // isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login/>
            <Login />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register />
            )
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/teams"
          element={isAuthenticated ? <Teams /> : <Navigate to="/" replace />}
        />
        <Route
          path="/teams/:teamId/manage"
          element={isAuthenticated ? <TeamManage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/channels"
          element={isAuthenticated ? <Channels /> : <Navigate to="/" replace />}
        />
        <Route
          path="/channels/:channelId"
          element={isAuthenticated ? <ChannelScreen /> : <Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
