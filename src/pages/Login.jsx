import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ setUser }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    setError(""); 
    
    // Get all registered users
    const allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    
    if (allUsers.length === 0) {
      setError("No users registered. Please register first.");
      return;
    }
    
    try {
      // Find user with matching credentials
      const foundUser = allUsers.find(user => 
        user.username === form.username && user.password === form.password
      );
      
      if (foundUser) {
        // Set as current user
        localStorage.setItem("authUser", JSON.stringify(foundUser));
        setUser(foundUser);
        
        // Navigate based on user role
        if (foundUser.role === 'provider') {
          navigate("/dashboard"); 
        } else {
          navigate("/"); 
        }
      } else {
        setError("Invalid username or password. Please try again.");
      }
    } catch (err) {
      setError("Error reading user data. Please try again.");
      console.error("Login error:", err);
    }
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #676EC2 0%, #252436 100%)",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "#ffffff",
        padding: "40px",
        borderRadius: "20px",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
        width: "100%",
        maxWidth: "400px"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{
            fontSize: "48px",
            marginBottom: "16px"
          }}>🅿️</div>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "800",
            color: "#374151",
            marginBottom: "8px",
            letterSpacing: "-0.5px"
          }}>
            Welcome Back
          </h1>
          <p style={{
            color: "#6b7280",
            fontSize: "16px",
            fontWeight: "500",
            margin: 0
          }}>
            Sign in to Find My Space
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px"
            }}>
              👤 Username
            </label>
            <input
              name="username"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "2px solid #e5e7eb",
                fontSize: "16px",
                fontWeight: "500",
                background: "#f9fafb",
                transition: "all 0.3s ease",
                boxSizing: "border-box"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#676EC2";
                e.target.style.background = "#ffffff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.background = "#f9fafb";
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px"
            }}>
              🔒 Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "2px solid #e5e7eb",
                fontSize: "16px",
                fontWeight: "500",
                background: "#f9fafb",
                transition: "all 0.3s ease",
                boxSizing: "border-box"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#676EC2";
                e.target.style.background = "#ffffff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.background = "#f9fafb";
              }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "12px 16px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "20px",
              textAlign: "center"
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "16px",
              background: "linear-gradient(135deg, #676EC2 0%, #252436 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              marginBottom: "20px"
            }}
            onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
            onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
          >
            🚀 Sign In
          </button>

          {/* Register Link */}
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#676EC2",
                  fontWeight: "600",
                  cursor: "pointer",
                  textDecoration: "underline"
                }}
              >
                Sign Up
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}