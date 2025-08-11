import React, { useState, useEffect } from 'react';
import ProviderNavbar from '../components/ProviderNavbar';
import { getProviderData, addProviderSpot, updateBookingStatus, updateNotificationStatus } from '../Data/SeedData';

const initialSpot = {
  location: '',
  price: '',
  totalSlots: '', // Added totalSlots field
  details: '',
  isEvent: false,
};

function ProviderDashboard({ provider, setUser }) {
  const [spots, setSpots] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(initialSpot);
  const [profit, setProfit] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Load provider's data
    loadProviderData();
    
    // Load saved profit
    const savedProfit = localStorage.getItem(`provider_profit_${provider?.id}`);
    if (savedProfit) {
      setProfit(JSON.parse(savedProfit));
    }

    // Listen for updates
    const handleDataUpdate = () => {
      loadProviderData();
    };

    window.addEventListener('parking-updated', handleDataUpdate);
    window.addEventListener('notification-updated', handleDataUpdate);
    window.addEventListener('booking-updated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('parking-updated', handleDataUpdate);
      window.removeEventListener('notification-updated', handleDataUpdate);
      window.removeEventListener('booking-updated', handleDataUpdate);
    };
  }, [provider]);

  const loadProviderData = () => {
    if (provider?.id) {
      const data = getProviderData(provider.id);
      setSpots(data.spots);
      setNotifications(data.notifications);
      setBookings(data.bookings);
    }
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddSpot = e => {
    e.preventDefault();
    
    // Validation
    if (!form.totalSlots || parseInt(form.totalSlots) <= 0) {
      alert('Please enter a valid number of total slots (greater than 0)');
      return;
    }
    
    // Restrict advance payment for first 3 spots
    const advancePaymentAllowed = spots.length >= 3;
    const spotData = {
      ...form,
      providerId: provider?.id,
      providerName: provider?.businessName || provider?.username,
      advancePaymentAllowed,
      totalSlots: parseInt(form.totalSlots), 
      available: parseInt(form.totalSlots) 
    };

    // Add spot 
    const newSpot = addProviderSpot(spotData);
    
    // Update local state
    setSpots([...spots, newSpot]);
    setForm(initialSpot);
    
    // Trigger update events
    window.dispatchEvent(new Event('parking-updated'));
    
    alert("Parking spot added successfully! It will appear on the user dashboard.");
  };

  const handleAcceptBooking = (notificationId, bookingId) => {
    // Update booking status
    updateBookingStatus(bookingId, 'confirmed');
    
    // Update notification status
    updateNotificationStatus(notificationId, 'accepted');
    
    // Update analytics 
    const acceptedBooking = bookings.find(b => b.id === bookingId);
    if (acceptedBooking) {
      const newProfit = profit + acceptedBooking.totalCost;
      setProfit(newProfit);
      localStorage.setItem(`provider_profit_${provider?.id}`, JSON.stringify(newProfit));
    }

    // Reload data
    loadProviderData();
    
    // Trigger events
    window.dispatchEvent(new Event('booking-updated'));
    window.dispatchEvent(new Event('notification-updated'));

    alert("Booking accepted successfully! Your profit has been updated.");
  };

  const handleRejectBooking = (notificationId, bookingId) => {
    // Update booking status
    updateBookingStatus(bookingId, 'rejected');
    
    // Update notification status
    updateNotificationStatus(notificationId, 'rejected');

    // Reload data
    loadProviderData();
    
    // Trigger events
    window.dispatchEvent(new Event('booking-updated'));
    window.dispatchEvent(new Event('notification-updated'));

    alert("Booking rejected.");
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div style={{ padding: "20px" }}>
            <div style={{
              background: "linear-gradient(135deg, #fdfdfd 0%, #f4f6f8 100%)",
              padding: "30px",
              borderRadius: "16px",
              border: "1px solid #e8eaed",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
              marginBottom: "30px",
              textAlign: "center"
            }}>
              <h1 style={{
                fontSize: "32px",
                fontWeight: "800",
                color: "#374151",
                marginBottom: "10px"
              }}>
                Welcome, {provider?.businessName || provider?.username || 'Provider'}!
              </h1>
              <p style={{
                fontSize: "16px",
                color: "#6b7280",
                margin: 0
              }}>
                Manage your parking spaces and track your business
              </p>
            </div>

            {/* Stats Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
              marginBottom: "30px"
            }}>
              <div style={{
                background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                padding: "24px",
                borderRadius: "16px",
                border: "1px solid #93c5fd"
              }}>
                <div style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  color: "#1d4ed8",
                  marginBottom: "8px"
                }}>
                  {spots.length}
                </div>
                <div style={{
                  fontSize: "14px",
                  color: "#374151",
                  fontWeight: "600"
                }}>
                  Total Spots
                </div>
              </div>

              <div style={{
                background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                padding: "24px",
                borderRadius: "16px",
                border: "1px solid #6ee7b7"
              }}>
                <div style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  color: "#047857",
                  marginBottom: "8px"
                }}>
                  ₹{profit}
                </div>
                <div style={{
                  fontSize: "14px",
                  color: "#374151",
                  fontWeight: "600"
                }}>
                  Total Profit
                </div>
              </div>

              <div style={{
                background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                padding: "24px",
                borderRadius: "16px",
                border: "1px solid #f59e0b"
              }}>
                <div style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  color: "#d97706",
                  marginBottom: "8px"
                }}>
                  {spots.filter(s => s.advancePaymentAllowed).length}
                </div>
                <div style={{
                  fontSize: "14px",
                  color: "#374151",
                  fontWeight: "600"
                }}>
                  Premium Spots
                </div>
              </div>

              <div style={{
                background: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)",
                padding: "24px",
                borderRadius: "16px",
                border: "1px solid #c084fc"
              }}>
                <div style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  color: "#7c3aed",
                  marginBottom: "8px"
                }}>
                  {notifications.filter(n => n.status === 'pending').length}
                </div>
                <div style={{
                  fontSize: "14px",
                  color: "#374151",
                  fontWeight: "600"
                }}>
                  Pending Requests
                </div>
              </div>
            </div>

            {/* Recent Spots */}
            <div style={{
              background: "#ffffff",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)"
            }}>
              <h3 style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#374151",
                marginBottom: "20px"
              }}>
                Your Spots
              </h3>
              {spots.length === 0 ? (
                <p style={{ color: "#6b7280", textAlign: "center", padding: "20px" }}>
                  No spots added yet. Click "Add Parking Spots" to get started!
                </p>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {spots.map((spot) => (
                    <div key={spot.id} style={{
                      background: "#f8fafc",
                      padding: "16px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                            {spot.isEvent ? '🎉' : '🅿️'} {spot.location}
                          </div>
                          <div style={{ color: "#6b7280", fontSize: "14px" }}>
                            ₹{spot.price}/hr • Available: {spot.available}/{spot.totalSlots} • {spot.details}
                          </div>
                        </div>
                        <div style={{
                          background: spot.advancePaymentAllowed ? "#dcfce7" : "#fef2f2",
                          color: spot.advancePaymentAllowed ? "#16a34a" : "#dc2626",
                          padding: "4px 8px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}>
                          {spot.advancePaymentAllowed ? "Premium" : "Basic"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div style={{ padding: "20px" }}>
            <h2 style={{
              fontSize: "28px",
              fontWeight: "800",
              color: "#374151",
              marginBottom: "30px"
            }}>
              📈 Analytics & Insights
            </h2>
            
            {/* Analytics Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
              marginBottom: "30px"
            }}>
              <div style={{
                background: "#ffffff",
                padding: "24px",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)"
              }}>
                <h4 style={{ color: "#374151", marginBottom: "16px", fontSize: "18px" }}>
                  💰 Revenue Breakdown
                </h4>
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontWeight: "600", color: "#059669", fontSize: "24px" }}>
                    ₹{profit}
                  </div>
                  <div style={{ color: "#6b7280", fontSize: "14px" }}>Total Profit</div>
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <div style={{ fontWeight: "500", color: "#374151" }}>
                    {bookings.filter(b => b.status === 'confirmed').length} Confirmed Bookings
                  </div>
                </div>
                <div style={{ color: "#6b7280", fontSize: "13px" }}>
                  Average per booking: ₹{bookings.filter(b => b.status === 'confirmed').length > 0 
                    ? Math.round(profit / bookings.filter(b => b.status === 'confirmed').length) 
                    : 0}
                </div>
              </div>

              <div style={{
                background: "#ffffff",
                padding: "24px",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)"
              }}>
                <h4 style={{ color: "#374151", marginBottom: "16px", fontSize: "18px" }}>
                  📊 Booking Statistics
                </h4>
                <div style={{ display: "grid", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#6b7280" }}>Confirmed:</span>
                    <span style={{ fontWeight: "600", color: "#059669" }}>
                      {bookings.filter(b => b.status === 'confirmed').length}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#6b7280" }}>Pending:</span>
                    <span style={{ fontWeight: "600", color: "#f59e0b" }}>
                      {bookings.filter(b => b.status === 'pending').length}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#6b7280" }}>Rejected:</span>
                    <span style={{ fontWeight: "600", color: "#dc2626" }}>
                      {bookings.filter(b => b.status === 'rejected').length}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{
                background: "#ffffff",
                padding: "24px",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)"
              }}>
                <h4 style={{ color: "#374151", marginBottom: "16px", fontSize: "18px" }}>
                  🏪 Spot Performance
                </h4>
                <div style={{ display: "grid", gap: "8px" }}>
                  {spots.slice(0, 3).map((spot, index) => (
                    <div key={spot.id} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px",
                      background: "#f8fafc",
                      borderRadius: "8px"
                    }}>
                      <div style={{ fontSize: "14px", color: "#374151" }}>
                        {spot.location}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        ₹{spot.price}/hr
                      </div>
                    </div>
                  ))}
                  {spots.length === 0 && (
                    <div style={{ color: "#6b7280", fontSize: "14px", textAlign: "center" }}>
                      No spots added yet
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div style={{
              background: "#ffffff",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)"
            }}>
              <h4 style={{ color: "#374151", marginBottom: "16px", fontSize: "18px" }}>
                📅 Recent Bookings
              </h4>
              {bookings.length === 0 ? (
                <div style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>
                  No bookings yet
                </div>
              ) : (
                <div style={{ display: "grid", gap: "8px" }}>
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      background: "#f8fafc",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0"
                    }}>
                      <div>
                        <div style={{ fontWeight: "500", color: "#374151", fontSize: "14px" }}>
                          {booking.userName} • {booking.spotName}
                        </div>
                        <div style={{ color: "#6b7280", fontSize: "12px" }}>
                          {booking.date} • {booking.startTime}-{booking.endTime}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: "600", color: "#059669", fontSize: "14px" }}>
                          ₹{booking.totalCost}
                        </div>
                        <div style={{
                          fontSize: "10px",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: booking.status === 'confirmed' ? "#dcfce7" : 
                                     booking.status === 'pending' ? "#fef3c7" : "#fef2f2",
                          color: booking.status === 'confirmed' ? "#16a34a" : 
                                booking.status === 'pending' ? "#d97706" : "#dc2626"
                        }}>
                          {booking.status.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'addSpot':
        return (
          <div style={{ padding: "20px" }}>
            <h2 style={{
              fontSize: "28px",
              fontWeight: "800",
              color: "#374151",
              marginBottom: "30px"
            }}>
              ➕ Add New Parking Spot
            </h2>

            <div style={{
              background: "#ffffff",
              padding: "30px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              maxWidth: "600px",
              margin: "0 auto"
            }}>
              <form onSubmit={handleAddSpot}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px"
                  }}>
                    📍 Location
                  </label>
                  <input
                    name="location"
                    placeholder="Enter parking spot location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginBottom: "20px"
                }}>
                  <div>
                    <label style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#374151",
                      marginBottom: "8px"
                    }}>
                      💰 Price per Hour (₹)
                    </label>
                    <input
                      name="price"
                      type="number"
                      placeholder="Enter price per hour"
                      value={form.price}
                      onChange={handleChange}
                      required
                      min="1"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#374151",
                      marginBottom: "8px"
                    }}>
                      🚗 Total Available Slots
                    </label>
                    <input
                      name="totalSlots"
                      type="number"
                      placeholder="e.g., 50"
                      value={form.totalSlots}
                      onChange={handleChange}
                      required
                      min="1"
                      max="1000"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px"
                  }}>
                    📝 Details
                  </label>
                  <textarea
                    name="details"
                    placeholder="Add additional details about the parking spot"
                    value={form.details}
                    onChange={handleChange}
                    rows="4"
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      minHeight: "100px"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    cursor: "pointer"
                  }}>
                    <input
                      name="isEvent"
                      type="checkbox"
                      checked={form.isEvent}
                      onChange={handleChange}
                      style={{
                        width: "18px",
                        height: "18px",
                        accentColor: "#667eea"
                      }}
                    />
                    🎉 This is an Event Spot
                  </label>
                </div>

                {/* Payment Status Info */}
                <div style={{
                  background: spots.length >= 3 ? "#f0fdf4" : "#fef3c7",
                  border: spots.length >= 3 ? "1px solid #bbf7d0" : "1px solid #fde68a",
                  padding: "16px",
                  borderRadius: "12px",
                  marginBottom: "24px"
                }}>
                  <div style={{
                    color: spots.length >= 3 ? "#166534" : "#92400e",
                    fontWeight: "600",
                    fontSize: "14px",
                    marginBottom: "4px"
                  }}>
                    {spots.length >= 3 ? "✅ Premium Features Enabled" : "⚠️ Basic Plan Active"}
                  </div>
                  <div style={{
                    color: spots.length >= 3 ? "#15803d" : "#a16207",
                    fontSize: "13px"
                  }}>
                    {spots.length >= 3 
                      ? "Advance payment is enabled for this spot"
                      : `Add ${3 - spots.length} more spot${3 - spots.length > 1 ? 's' : ''} to unlock advance payment`
                    }
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "16px",
                    background: "#303f63",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
                  onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
                >
                  🚀 Add Parking Spot
                </button>
              </form>
            </div>
          </div>
        );

      // ... rest of the cases remain the same ...
      case 'notifications':
        return (
          <div style={{ padding: "20px" }}>
            <h2 style={{
              fontSize: "28px",
              fontWeight: "800",
              color: "#374151",
              marginBottom: "30px"
            }}>
              🔔 Booking Notifications
            </h2>
            
            <div style={{
              background: "#ffffff",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)"
            }}>
              {notifications.filter(n => n.status === 'pending').length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#6b7280"
                }}>
                  <div style={{ fontSize: "64px", marginBottom: "20px" }}>📭</div>
                  <h3 style={{ color: "#374151", marginBottom: "8px" }}>
                    No New Notifications
                  </h3>
                  <p>You'll see booking requests here when customers want to book your spots.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "16px" }}>
                  {notifications
                    .filter(n => n.status === 'pending')
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((notification) => (
                      <div key={notification.id} style={{
                        background: "#fefce8",
                        border: "1px solid #fde047",
                        padding: "20px",
                        borderRadius: "12px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start"
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: "16px",
                            fontWeight: "700",
                            color: "#374151",
                            marginBottom: "8px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                          }}>
                            🚗 New Booking Request
                            <span style={{
                              background: "#fbbf24",
                              color: "#92400e",
                              padding: "2px 8px",
                              borderRadius: "12px",
                              fontSize: "12px"
                            }}>
                              PENDING
                            </span>
                          </div>
                          
                          <div style={{ color: "#6b7280", fontSize: "14px", marginBottom: "12px" }}>
                            <div><strong>Customer:</strong> {notification.userName}</div>
                            <div><strong>Spot:</strong> {notification.spotName}</div>
                            <div><strong>Date & Time:</strong> {notification.date} ({notification.startTime} - {notification.endTime})</div>
                            <div><strong>Total Cost:</strong> <span style={{ color: "#059669", fontWeight: "600" }}>₹{notification.totalCost}</span></div>
                          </div>
                          
                          <div style={{ fontSize: "12px", color: "#8b5cf6" }}>
                            Received: {new Date(notification.createdAt).toLocaleString()}
                          </div>
                        </div>
                        
                        <div style={{ display: "flex", gap: "8px", marginLeft: "16px" }}>
                          <button
                            onClick={() => handleAcceptBooking(notification.id, notification.bookingId)}
                            style={{
                              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                              color: "white",
                              border: "none",
                              padding: "10px 16px",
                              borderRadius: "8px",
                              fontSize: "14px",
                              fontWeight: "600",
                              cursor: "pointer",
                              transition: "all 0.3s ease"
                            }}
                          >
                            ✅ Accept
                          </button>
                          
                          <button
                            onClick={() => handleRejectBooking(notification.id, notification.bookingId)}
                            style={{
                              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                              color: "white",
                              border: "none",
                              padding: "10px 16px",
                              borderRadius: "8px",
                              fontSize: "14px",
                              fontWeight: "600",
                              cursor: "pointer",
                              transition: "all 0.3s ease"
                            }}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Recent Activity */}
              {notifications.filter(n => n.status !== 'pending').length > 0 && (
                <>
                  <h4 style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#374151",
                    marginTop: "30px",
                    marginBottom: "16px"
                  }}>
                    📜 Recent Activity
                  </h4>
                  
                  <div style={{ display: "grid", gap: "8px" }}>
                    {notifications
                      .filter(n => n.status !== 'pending')
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .slice(0, 5)
                      .map((notification) => (
                        <div key={notification.id} style={{
                          background: notification.status === 'accepted' ? "#f0fdf4" : "#fef2f2",
                          border: notification.status === 'accepted' ? "1px solid #bbf7d0" : "1px solid #fecaca",
                          padding: "12px 16px",
                          borderRadius: "8px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}>
                          <div style={{
                            fontSize: "14px",
                            color: "#374151"
                          }}>
                            {notification.status === 'accepted' ? '✅' : '❌'} {notification.userName} • {notification.spotName} • ₹{notification.totalCost}
                          </div>
                          
                          <div style={{
                            fontSize: "12px",
                            color: "#6b7280"
                          }}>
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div style={{ padding: "20px" }}>
            <h2 style={{
              fontSize: "28px",
              fontWeight: "800",
              color: "#374151",
              marginBottom: "30px"
            }}>
              👤 Profile Settings
            </h2>
            
            <div style={{
              background: "#ffffff",
              padding: "40px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              textAlign: "center",
              maxWidth: "500px",
              margin: "0 auto"
            }}>
              <div style={{ fontSize: "80px", marginBottom: "20px" }}>👨‍💼</div>
              <h3 style={{ color: "#374151", marginBottom: "8px" }}>
                {provider?.businessName || provider?.username || 'Business Name'}
              </h3>
              <p style={{ color: "#6b7280", fontSize: "16px", marginBottom: "20px" }}>
                {provider?.email || 'provider@example.com'}
              </p>
              <div style={{
                background: "#f8fafc",
                padding: "16px",
                borderRadius: "12px",
                textAlign: "left"
              }}>
                <div style={{ marginBottom: "8px", fontSize: "14px", color: "#6b7280" }}>
                  <strong>Account Type:</strong> Parking Provider
                </div>
                <div style={{ marginBottom: "8px", fontSize: "14px", color: "#6b7280" }}>
                  <strong>Total Spots:</strong> {spots.length}
                </div>
                <div style={{ marginBottom: "8px", fontSize: "14px", color: "#6b7280" }}>
                  <strong>Total Profit:</strong> ₹{profit}
                </div>
                <div style={{ marginBottom: "8px", fontSize: "14px", color: "#6b7280" }}>
                  <strong>Member Since:</strong> {new Date().getFullYear()}
                </div>
                <div style={{ fontSize: "14px", color: "#6b7280" }}>
                  <strong>Status:</strong> <span style={{ color: "#16a34a" }}>Active</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      background: "linear-gradient(to bottom, #f8f9fa, #ffffff)",
      minHeight: "100vh"
    }}>
      <ProviderNavbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        provider={provider}
        setUser={setUser}
      />
      {renderContent()}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "12px",
  border: "2px solid #e5e7eb",
  fontSize: "16px",
  fontWeight: "500",
  background: "#f9fafb",
  transition: "all 0.3s ease",
  boxSizing: "border-box"
};

export default ProviderDashboard;