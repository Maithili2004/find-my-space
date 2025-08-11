import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookings } from '../Data/SeedData';
import { cancelBooking } from '../Data/SeedData';

const BookParking = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user
    const storedUser = localStorage.getItem("authUser");
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    const user = JSON.parse(storedUser);
    setCurrentUser(user);

    // Load user's bookings
    loadUserBookings(user.id);

    // Listen for booking updates
    const handleBookingUpdate = () => {
      loadUserBookings(user.id);
    };

    window.addEventListener('booking-updated', handleBookingUpdate);
    window.addEventListener('notification-updated', handleBookingUpdate);
    
    return () => {
      window.removeEventListener('booking-updated', handleBookingUpdate);
      window.removeEventListener('notification-updated', handleBookingUpdate);
    };
  }, [navigate]);

  const loadUserBookings = (userId) => {
    const allBookings = getBookings();
    const userBookings = allBookings.filter(booking => booking.userId === userId);
    setBookings(userBookings);
  };

 const handleCancelBooking = (bookingId, booking) => {
  if (booking.status === 'rejected') {
    alert("Cannot cancel a rejected booking.");
    return;
  }

  if (window.confirm("Are you sure you want to cancel this booking?")) {
    // Use the helper function to cancel booking (handles availability automatically)
    const cancelledBooking = cancelBooking(bookingId);
    
    if (cancelledBooking) {
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(b => 
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        )
      );
      
      alert("Booking cancelled successfully!");
    } else {
      alert("Error cancelling booking. Please try again.");
    }
  }
};

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' };
      case 'pending':
        return { bg: '#fef3c7', color: '#d97706', border: '#fde68a' };
      case 'rejected':
        return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
      case 'cancelled':
        return { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' };
      default:
        return { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return '✅';
      case 'pending':
        return '⏳';
      case 'rejected':
        return '❌';
      case 'cancelled':
        return '🚫';
      default:
        return '📝';
    }
  };

  const canCancelBooking = (booking) => {
    return booking.status === 'confirmed' || booking.status === 'pending';
  };

  return (
    <div style={{
      background: "linear-gradient(to bottom, #f8f9fa, #ffffff)",
      minHeight: "100vh",
      padding: "20px"
    }}>
      <div style={{
        maxWidth: "1000px",
        margin: "0 auto"
      }}>
        {/* Header */}
        <div style={{
          background: "#ffffff",
          padding: "30px",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
          marginBottom: "30px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
          <h1 style={{
            fontSize: "32px",
            fontWeight: "800",
            color: "#374151",
            marginBottom: "10px"
          }}>
            My Bookings
          </h1>
          <p style={{
            fontSize: "16px",
            color: "#6b7280",
            margin: 0
          }}>
            Track all your parking spot reservations
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "30px"
        }}>
          <div style={{
            background: "#ffffff",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#059669", marginBottom: "4px" }}>
              {bookings.filter(b => b.status === 'confirmed').length}
            </div>
            <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: "600" }}>
              Confirmed
            </div>
          </div>

          <div style={{
            background: "#ffffff",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#d97706", marginBottom: "4px" }}>
              {bookings.filter(b => b.status === 'pending').length}
            </div>
            <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: "600" }}>
              Pending
            </div>
          </div>

          <div style={{
            background: "#ffffff",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#dc2626", marginBottom: "4px" }}>
              {bookings.filter(b => b.status === 'rejected').length}
            </div>
            <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: "600" }}>
              Rejected
            </div>
          </div>

          <div style={{
            background: "#ffffff",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#374151", marginBottom: "4px" }}>
              ₹{bookings.filter(b => b.status === 'confirmed').reduce((total, b) => total + b.totalCost, 0)}
            </div>
            <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: "600" }}>
              Total Spent
            </div>
          </div>
        </div>

        {/* Bookings List */}
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
            All Bookings
          </h3>

          {bookings.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "40px",
              color: "#6b7280"
            }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>🚗</div>
              <h3 style={{ color: "#374151", marginBottom: "8px" }}>
                No Bookings Yet
              </h3>
              <p style={{ marginBottom: "20px" }}>
                You haven't made any parking reservations yet.
              </p>
              <button
                onClick={() => navigate('/')}
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Find Parking Spots
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {bookings
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((booking) => {
                  const statusStyle = getStatusColor(booking.status);
                  return (
                    <div key={booking.id} style={{
                      background: "#f8fafc",
                      padding: "20px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0"
                    }}>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "12px"
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: "18px",
                            fontWeight: "700",
                            color: "#374151",
                            marginBottom: "8px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                          }}>
                            {booking.isProviderSpot ? '🏪' : '🅿️'} {booking.spotName}
                            {booking.isProviderSpot && (
                              <span style={{
                                background: "#dbeafe",
                                color: "#1e40af",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: "600"
                              }}>
                                Provider
                              </span>
                            )}
                          </div>
                          
                          <div style={{ color: "#6b7280", fontSize: "14px", marginBottom: "8px" }}>
                            📍 {booking.spotAddress}
                          </div>
                          
                          <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                            gap: "8px",
                            fontSize: "13px",
                            color: "#6b7280"
                          }}>
                            <div><strong>Date:</strong> {booking.date}</div>
                            <div><strong>Time:</strong> {booking.startTime} - {booking.endTime}</div>
                            <div><strong>Duration:</strong> {booking.hours} hours</div>
                            <div><strong>Vehicle:</strong> {booking.vehicle}</div>
                            {booking.phone && <div><strong>Phone:</strong> {booking.phone}</div>}
                          </div>
                        </div>
                        
                        <div style={{ 
                          textAlign: "right",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: "8px"
                        }}>
                          <div style={{
                            background: statusStyle.bg,
                            color: statusStyle.color,
                            border: `1px solid ${statusStyle.border}`,
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            {getStatusIcon(booking.status)} {booking.status}
                          </div>
                          
                          <div style={{
                            fontSize: "18px",
                            fontWeight: "800",
                            color: "#059669"
                          }}>
                            ₹{booking.totalCost}
                          </div>

                          {/* Cancel Button - Only show for confirmed or pending bookings */}
                          {canCancelBooking(booking) && (
                            <button
                              onClick={() => handleCancelBooking(booking.id, booking)}
                              style={{
                                padding: "6px 12px",
                                background: "#dc2626",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.3s ease"
                              }}
                              onMouseOver={(e) => e.target.style.background = "#b91c1c"}
                              onMouseOut={(e) => e.target.style.background = "#dc2626"}
                            >
                              🚫 Cancel
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div style={{
                        fontSize: "12px",
                        color: "#8b5cf6",
                        textAlign: "right",
                        marginBottom: "8px"
                      }}>
                        Booked: {new Date(booking.createdAt).toLocaleString()}
                      </div>
                      
                      {/* Status-specific messages */}
                      {booking.status === 'pending' && booking.isProviderSpot && (
                        <div style={{
                          padding: "8px 12px",
                          background: "#fffbeb",
                          border: "1px solid #fde68a",
                          borderRadius: "8px",
                          fontSize: "12px",
                          color: "#92400e"
                        }}>
                          ⏳ Waiting for provider approval. You'll be notified once the booking is confirmed.
                        </div>
                      )}
                      
                      {booking.status === 'rejected' && (
                        <div style={{
                          padding: "8px 12px",
                          background: "#fef2f2",
                          border: "1px solid #fecaca",
                          borderRadius: "8px",
                          fontSize: "12px",
                          color: "#dc2626"
                        }}>
                          ❌ This booking was rejected by the provider. You can try booking another spot.
                        </div>
                      )}
                      
                      {booking.status === 'cancelled' && (
                        <div style={{
                          padding: "8px 12px",
                          background: "#f9fafb",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "12px",
                          color: "#6b7280"
                        }}>
                          🚫 This booking was cancelled.
                        </div>
                      )}
                      
                      {booking.status === 'confirmed' && (
                        <div style={{
                          padding: "8px 12px",
                          background: "#f0fdf4",
                          border: "1px solid #bbf7d0",
                          borderRadius: "8px",
                          fontSize: "12px",
                          color: "#166534"
                        }}>
                          ✅ Booking confirmed! Please arrive on time at the specified location.
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookParking;