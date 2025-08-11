import React, { useState } from "react";
import { addBooking, addNotification, hasAvailability } from '../Data/SeedData';

export default function ParkingCard({ spot }) {
  const [showBook, setShowBook] = useState(false);
  const [form, setForm] = useState({
    name: "",
    vehicle: "",
    phone: "",
    date: "",
    startTime: "12:00 AM",
    endTime: "1:00 PM"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  //Time 24-hour format for calculations
  const convertTo24Hour = (time12) => {
    const [time, period] = time12.split(' ');
    const [hour, minute] = time.split(':');
    let hour24 = parseInt(hour);
    
    if (period === "AM" && hour24 === 12) {
      hour24 = 0;
    } else if (period === "PM" && hour24 !== 12) {
      hour24 += 12;
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minute}`;
  };

  // Calculate hours between two times
  const calculateHours = (startTime12, endTime12) => {
    const startTime24 = convertTo24Hour(startTime12);
    const endTime24 = convertTo24Hour(endTime12);
    
    const start = new Date(`2000-01-01T${startTime24}:00`);
    const end = new Date(`2000-01-01T${endTime24}:00`);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours > 0 ? diffHours : 0;
  };

  //  time options with AM/PM
  const generateTimeOptions = () => {
    const times = [];
    
    // times every 30 minutes
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Convert to 12-hour format
        let displayHour = hour;
        const period = hour >= 12 ? 'PM' : 'AM';
        
        if (hour === 0) {
          displayHour = 12;
        } else if (hour > 12) {
          displayHour = hour - 12;
        }
        
        const timeString = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
        times.push(timeString);
      }
    }
    
    return times;
  };

  const timeOptions = generateTimeOptions();

  const handleBook = (e) => {
  e.preventDefault();
  
  const currentUser = JSON.parse(localStorage.getItem("authUser"));
  if (!currentUser) {
    alert("Please login to book a parking spot");
    return;
  }

  // Check if spot still has availability
  if (!hasAvailability(spot.id)) {
    alert("Sorry, this parking spot is no longer available. Please refresh the page.");
    return;
  }

  // Validate time selection
  const hours = calculateHours(form.startTime, form.endTime);
  if (hours <= 0) {
    alert("Please select valid start and end times. End time must be after start time.");
    return;
  }

  const totalCost = hours * spot.pricePerHour;


    // Create booking object
  const newBooking = {
    spotId: spot.id,
    spotName: spot.name,
    spotAddress: spot.address,
    userId: currentUser.id,
    userName: currentUser.username,
    userEmail: currentUser.email,
    name: form.name,
    vehicle: form.vehicle,
    phone: form.phone,
    date: form.date,
    startTime: form.startTime,
    endTime: form.endTime,
    startTime24: convertTo24Hour(form.startTime),
    endTime24: convertTo24Hour(form.endTime),
    hours: hours,
    totalCost: totalCost,
    status: spot.isProviderSpot ? 'pending' : 'confirmed',
    providerId: spot.providerId || null,
    providerName: spot.providerName || null,
    isProviderSpot: spot.isProviderSpot || false
  };

    // Add booking using helper function 
  const savedBooking = addBooking(newBooking);

  // If it's a provider spot, create notification for provider
  if (spot.isProviderSpot && spot.providerId) {
    const newNotification = {
      type: 'booking_request',
      providerId: spot.providerId,
      bookingId: savedBooking.id,
      userId: currentUser.id,
      userName: currentUser.username,
      spotName: spot.name,
      message: `New booking request from ${currentUser.username} for ${spot.name}`,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      totalCost: totalCost,
      status: 'pending'
    };
    
    addNotification(newNotification);
  }
    // Trigger update events
  window.dispatchEvent(new Event('booking-updated'));
  window.dispatchEvent(new Event('notification-updated'));

  alert(spot.isProviderSpot ? 
    "Booking request sent! Wait for provider approval." : 
    "Booking confirmed! Check your bookings page."
  );
  
  setShowBook(false);
  setForm({
    name: "",
    vehicle: "",
    phone: "",
    date: "",
    startTime: "12:00 AM",
    endTime: "1:00 PM"
  });
};

  return (
    <div style={{
      background: "#ffffff",
      padding: "24px",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
      transition: "all 0.3s ease",
      marginBottom: "20px"
    }}>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "flex-start",
        marginBottom: "16px" 
      }}>
        <div>
          <h3 style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#374151",
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            {spot.isProviderSpot ? '🏪' : '🅿️'} {spot.name}
            {spot.isProviderSpot && (
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
          </h3>
          <p style={{
            color: "#6b7280",
            fontSize: "14px",
            marginBottom: "4px"
          }}>
            📍 {spot.address}
          </p>
          {spot.providerName && (
            <p style={{
              color: "#8b5cf6",
              fontSize: "13px",
              fontWeight: "600"
            }}>
              👨‍💼 Managed by {spot.providerName}
            </p>
          )}
        </div>
        
        <div style={{
          background: spot.available > 0 ? "#dcfce7" : "#fef2f2",
          color: spot.available > 0 ? "#16a34a" : "#dc2626",
          padding: "8px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          {spot.available > 0 ? `${spot.available} Available` : "Full"}
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
        gap: "12px",
        marginBottom: "20px"
      }}>
        <div style={{
          background: "#f8fafc",
          padding: "12px",
          borderRadius: "8px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#374151" }}>
            {spot.slots}
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>
            Total Slots
          </div>
        </div>
        
        <div style={{
          background: "#f8fafc",
          padding: "12px",
          borderRadius: "8px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#059669" }}>
            ₹{spot.pricePerHour}
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>
            Per Hour
          </div>
        </div>

        {spot.advancePaymentAllowed && (
          <div style={{
            background: "#fef3c7",
            padding: "12px",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#d97706" }}>
              ✨ Premium
            </div>
            <div style={{ fontSize: "12px", color: "#a16207", fontWeight: "600" }}>
              Advance Pay
            </div>
          </div>
        )}
      </div>

      {/* Book Button */}
      {spot.available > 0 && (
        <button
          onClick={() => setShowBook(!showBook)}
          style={{
            width: "100%",
            padding: "14px",
            background: "#303f63",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          📅 {showBook ? "Cancel Booking" : "Book Now"}
        </button>
      )}

      {/* Booking Form */}
      {showBook && (
        <div style={{
          marginTop: "20px",
          padding: "20px",
          background: "#f8fafc",
          borderRadius: "12px",
          border: "1px solid #e2e8f0"
        }}>
          <h4 style={{ marginBottom: "16px", color: "#374151" }}>
            📝 Booking Details
          </h4>
          
          <form onSubmit={handleBook}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "16px"
            }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                  👤 Name
                </label>
                <input
                  name="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "2px solid #e2e8f0",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                  🚗 Vehicle Number
                </label>
                <input
                  name="vehicle"
                  placeholder="e.g., GA01AB1234"
                  value={form.vehicle}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "2px solid #e2e8f0",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                📞 Phone Number
              </label>
              <input
                name="phone"
                type="tel"
                placeholder="e.g., +91 9876543210"
                value={form.phone}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "2px solid #e2e8f0",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                📅 Date
              </label>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "2px solid #e2e8f0",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/*  Time Selectors */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "16px"
            }}>
              {/* Start Time */}
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                  🕐 Start Time
                </label>
                <select
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "2px solid #e2e8f0",
                    fontSize: "14px",
                    fontWeight: "500",
                    background: "#ffffff",
                    cursor: "pointer",
                    boxSizing: "border-box"
                  }}
                >
                  {timeOptions.map((time, index) => (
                    <option key={index} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* End Time */}
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                  🕐 End Time
                </label>
                <select
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "2px solid #e2e8f0",
                    fontSize: "14px",
                    fontWeight: "500",
                    background: "#ffffff",
                    cursor: "pointer",
                    boxSizing: "border-box"
                  }}
                >
                  {timeOptions.map((time, index) => (
                    <option key={index} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/*  Cost Preview */}
            <div style={{
              background: calculateHours(form.startTime, form.endTime) > 0 ? "#f0fdf4" : "#fef2f2",
              border: calculateHours(form.startTime, form.endTime) > 0 ? "1px solid #bbf7d0" : "1px solid #fecaca",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "16px",
              textAlign: "center"
            }}>
              {calculateHours(form.startTime, form.endTime) > 0 ? (
                <>
                  <div style={{ color: "#166534", fontWeight: "700", fontSize: "18px", marginBottom: "6px" }}>
                    💰 Total Cost: ₹{(calculateHours(form.startTime, form.endTime) * spot.pricePerHour).toFixed(2)}
                  </div>
                  <div style={{ color: "#15803d", fontSize: "14px", marginBottom: "4px" }}>
                    📅 {form.startTime} - {form.endTime}
                  </div>
                  <div style={{ color: "#16a34a", fontSize: "12px", fontWeight: "600" }}>
                    Duration: {calculateHours(form.startTime, form.endTime)} hours • Rate: ₹{spot.pricePerHour}/hr
                  </div>
                </>
              ) : (
                <div style={{ color: "#dc2626", fontWeight: "600" }}>
                  ⚠️ End time must be after start time
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={calculateHours(form.startTime, form.endTime) <= 0}
              style={{
                width: "100%",
                padding: "14px",
                background: calculateHours(form.startTime, form.endTime) <= 0 ? 
                  "#d1d5db" :
                  spot.isProviderSpot ? 
                    "#404e70" :
                    "linear-gradient(135deg, #059669 0%, #047857 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: calculateHours(form.startTime, form.endTime) <= 0 ? "not-allowed" : "pointer",
                transition: "all 0.3s ease"
              }}
            >
              {spot.isProviderSpot ? "📤 Send Booking Request" : "✅ Confirm Booking"}
            </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            }