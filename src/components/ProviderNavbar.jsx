import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications } from '../Data/SeedData';

const ProviderNavbar = ({ activeTab, setActiveTab, provider, setUser }) => {
  const navigate = useNavigate();
  const [pendingNotifications, setPendingNotifications] = useState(0);
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'addSpot', label: 'Add Parking Spots', icon: '➕' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', badge: pendingNotifications },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  useEffect(() => {
    // Load pending notifications count
    const loadNotifications = () => {
      if (provider?.id) {
        const notifications = getNotifications();
        const providerPendingCount = notifications.filter(
          n => n.providerId === provider.id && n.status === 'pending'
        ).length;
        setPendingNotifications(providerPendingCount);
      }
    };

    loadNotifications();

    // Listen for notification updates
    const handleNotificationUpdate = () => {
      loadNotifications();
    };

    window.addEventListener('notification-updated', handleNotificationUpdate);
    window.addEventListener('booking-updated', handleNotificationUpdate);
    
    return () => {
      window.removeEventListener('notification-updated', handleNotificationUpdate);
      window.removeEventListener('booking-updated', handleNotificationUpdate);
    };
  }, [provider]);

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem("authUser");
    setUser(null);
    // Redirect to login page
    navigate('/login');
  };

  return (
    <nav style={{
      background: "#0f172a",
      padding: "0",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 24px",
        maxWidth: "1400px",
        margin: "0 auto"
      }}>
        {/* Logo */}
        <div style={{
          fontSize: "24px",
          fontWeight: "800",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          minWidth: "200px",
          marginRight: "105px"
        }}>
          🅿️ Provider Portal
        </div>

        {/* Navigation Items */}
        <div style={{ 
          display: "flex", 
          gap: "4px", 
          alignItems: "center",
          flex: "1",
          justifyContent: "center"
        }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                background: activeTab === item.id ? "rgba(255, 255, 255, 0.2)" : "transparent",
                color: "white",
                border: "none",
                padding: "12px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "800",
                cursor: "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                position: "relative",
                whiteSpace: "nowrap"
              }}
              onMouseOver={(e) => {
                if (activeTab !== item.id) {
                  e.target.style.background = "rgba(255, 255, 255, 0.1)";
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== item.id) {
                  e.target.style.background = "transparent";
                }
              }}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              <span>{item.label}</span>
              
              {/* Notification Badge */}
              {item.badge > 0 && (
                <span style={{
                  position: "absolute",
                  top: "6px",
                  right: "6px",
                  background: "#ef4444",
                  color: "white",
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  fontSize: "10px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: item.badge > 0 ? "pulse 2s infinite" : "none"
                }}>
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right Side - Provider Info + Logout */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "12px",
          minWidth: "200px",
          justifyContent: "flex-end"
        }}>
          {/* Provider Info */}
          <div style={{
            color: "white",
            fontSize: "14px",
            fontWeight: "800",
            background: "rgba(255, 255, 255, 0.1)",
            padding: "8px 12px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <span style={{ fontSize: "16px" }}>👋</span>
            <span>{provider?.businessName || provider?.username || 'Provider'}</span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(220, 38, 38, 0.2)",
              color: "white",
              border: "1px solid rgba(220, 38, 38, 0.3)",
              padding: "10px 16px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "800",
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(220, 38, 38, 0.3)";
              e.target.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "rgba(220, 38, 38, 0.2)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <span style={{ fontSize: "16px" }}>🚪</span>
            Logout
          </button>
        </div>
      </div>

      {/*  pulse animation for notification badge */}
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
            }
          }
        `}
      </style>
    </nav>
  );
};

export default ProviderNavbar;