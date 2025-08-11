import React, { useEffect, useState } from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/NavBar";
import Dashboard from "./components/Dashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import BookParking from "./pages/BookParking";
import { seedIfNeeded } from "./Data/SeedData";
import Login from './pages/Login';
import Register from './pages/Register';

function AppContent({ user, setUser }) {
  const location = useLocation();
  
  // Check if current user is a provider AND on dashboard route
  const isProviderDashboard = user?.role === "provider" && location.pathname === "/dashboard";
  
  // Check if on login or register pages
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  
  // Show regular navbar only if NOT on provider dashboard AND NOT on auth pages
  const showRegularNavbar = !isProviderDashboard && !isAuthPage;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh" }}>
      {showRegularNavbar && <Navbar user={user} setUser={setUser} />}
      
      <div style={{ 
        maxWidth: isProviderDashboard ? "100%" : (isAuthPage ? "100%" : 1100), 
        margin: (isProviderDashboard || isAuthPage) ? "0" : "24px auto", 
        padding: (isProviderDashboard || isAuthPage) ? "0" : "0 16px" 
      }}>
        <Routes>
          {/* Redirect root to login if no user, otherwise to dashboard */}
          <Route path="/" element={
            user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } />
          <Route path="/home" element={<Dashboard />} />
          <Route path="/book" element={<BookParking />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route
            path="/dashboard"
            element={
              user ? (
                user.role === "provider" ? (
                  <ProviderDashboard provider={user} setUser={setUser} />
                ) : (
                  <Dashboard user={user} />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="*" element={<div><h2>Page not found</h2><Link to="/">Go home</Link></div>} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null); 

  useEffect(() => {
    seedIfNeeded();
    
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return <AppContent user={user} setUser={setUser} />;
}