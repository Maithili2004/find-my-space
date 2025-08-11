import React, { useEffect, useState } from "react";
import { getEvents, getParking } from "../Data/SeedData";
import EventList from "./EventList";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [parking, setParking] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");

  const loadData = () => {
    setEvents(getEvents());
    setParking(getParking());
  };

  useEffect(() => {
    loadData();
    
    // Listen for parking updates from providers
    const handleParkingUpdate = () => {
      loadData();
    };
    
    window.addEventListener('parking-updated', handleParkingUpdate);
    window.addEventListener('booking-updated', handleParkingUpdate);
    
    return () => {
      window.removeEventListener('parking-updated', handleParkingUpdate);
      window.removeEventListener('booking-updated', handleParkingUpdate);
    };
  }, []);

  const filteredParking = selectedEventId ? parking.filter(p => p.eventId === selectedEventId) : parking;

  const totalSlots = filteredParking.reduce((acc, p) => acc + p.slots, 0);
  const totalAvailable = filteredParking.reduce((acc, p) => acc + p.available, 0);

  return (
    <div style={{
      background: "linear-gradient(to bottom, #f8f9fa, #ffffff)",
      minHeight: "100vh",
      width: "100%",
      padding: "0"
    }}>
      {/* Header Section */}
      <div style={{
        background: "linear-gradient(135deg, #fdfdfd 0%, #f4f6f8 100%)",
        padding: "30px 20px",
        border: "none",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
        marginBottom: "0",
        width: "100%"
      }}>
        <div style={{
          textAlign: "center",
          marginBottom: "25px"
        }}>
          <h1 style={{
            fontSize: "36px",
            fontWeight: "800",
            color: "#374151",
            marginBottom: "10px",
            letterSpacing: "-1px"
          }}>
            🚗 Find My Space
          </h1>
          <p style={{
            fontSize: "18px",
            color: "#6b7280",
            fontWeight: "500",
            margin: 0
          }}>
            Discover and book your perfect parking spot
          </p>
        </div>

        {/* Controls Section */}
        <div style={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "space-between",
          background: "#f7fafc",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <label style={{
              fontWeight: "600",
              color: "#374151",
              fontSize: "16px"
            }}>
              🎯 Filter by event:
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                border: "2px solid #e2e8f0",
                fontSize: "16px",
                fontWeight: "500",
                background: "white",
                color: "#374151",
                cursor: "pointer",
                transition: "all 0.3s ease",
                minWidth: "200px"
              }}
            >
              <option value="">All parking spots</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} — {ev.date}
                </option>
              ))}
            </select>
          </div>

          {/* Stats Section */}
          <div style={{
            display: "flex",
            gap: "16px"
          }}>
            <div style={{
              background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
              padding: "16px 20px",
              borderRadius: "12px",
              textAlign: "center",
              border: "1px solid #93c5fd"
            }}>
              <div style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "#1d4ed8",
                marginBottom: "4px"
              }}>
                {totalSlots}
              </div>
              <div style={{
                fontSize: "12px",
                color: "#374151",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Total Slots
              </div>
            </div>

            <div style={{
              background: totalAvailable > 0 
                ? "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)" 
                : "linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)",
              padding: "16px 20px",
              borderRadius: "12px",
              textAlign: "center",
              border: totalAvailable > 0 ? "1px solid #6ee7b7" : "1px solid #f87171"
            }}>
              <div style={{
                fontSize: "24px",
                fontWeight: "800",
                color: totalAvailable > 0 ? "#047857" : "#dc2626",
                marginBottom: "4px"
              }}>
                {totalAvailable}
              </div>
              <div style={{
                fontSize: "12px",
                color: "#374151",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Available Now
              </div>
            </div>

            <div style={{
              background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
              padding: "16px 20px",
              borderRadius: "12px",
              textAlign: "center",
              border: "1px solid #f59e0b"
            }}>
              <div style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "#d97706",
                marginBottom: "4px"
              }}>
                {filteredParking.filter(p => p.isProviderSpot).length}
              </div>
              <div style={{
                fontSize: "12px",
                color: "#374151",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Provider Spots
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section  */}
      <div style={{ padding: "20px" }}>
        <EventList parking={filteredParking} events={events} />
      </div>
    </div>
  );
}