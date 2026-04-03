import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) { onLocationSelect(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

export default function AreaDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(
    JSON.parse(localStorage.getItem("selectedArea")) || null
  );
  const [searchText, setSearchText] = useState("");
  const [serviceStatus, setServiceStatus] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [markerPos, setMarkerPos] = useState([21.1702, 72.8311]);
  const [showMap, setShowMap] = useState(false);
  const [saving, setSaving] = useState(false); 
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:8081/api/areas")
      .then(res => res.json())
      .then(data => setAreas(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredAreas = areas.filter(a =>
    a.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    a.city?.toLowerCase().includes(searchText.toLowerCase())
  );

  const checkServiceByCoords = async (lat, lng) => {
    setMarkerPos([lat, lng]);
    try {
      const res = await fetch("http://localhost:8081/api/areas/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng }),
      });
      const data = await res.json();
      setServiceStatus(data);
      if (data.available && data.area) {
        setSelectedArea(data.area);
        localStorage.setItem("selectedArea", JSON.stringify(data.area));
      }
    } catch (err) { console.error(err); }
  };

  const handleAreaSelect = (area) => {
    setSelectedArea(area);
    setServiceStatus({ available: area.serviceAvailable, area });
    localStorage.setItem("selectedArea", JSON.stringify(area));
    if (area.location?.coordinates) {
      const [lng, lat] = area.location.coordinates;
      setMarkerPos([lat, lng]);
    }
    setSearchText("");
    setShowMap(true);
  };

  const handleGPS = () => {
    setGpsLoading(true);
    setShowMap(false);
    setServiceStatus(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        await checkServiceByCoords(lat, lng);
        setShowMap(true);
        setGpsLoading(false);
      },
      () => { alert("Location access denied."); setGpsLoading(false); }
    );
  };

  
  const handleConfirmDelivery = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user?._id && selectedArea) {
      setSaving(true);
      try {
        const res = await fetch("http://localhost:8081/api/users/save-location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user._id,
            latitude: markerPos[0],
            longitude: markerPos[1],
            areaName: selectedArea.name,
            city: selectedArea.city,
          }),
        });
        const data = await res.json();
        if (data.success) {
          console.log(" Address saved to MongoDB!");
        }
      } catch (err) {
        console.error(" Address save failed:", err);
      } finally {
        setSaving(false);
      }
    } else {
      console.warn(" User not logged in or no area selected");
    }

    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative", zIndex: 1000 }}>

      
      <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: "pointer", minWidth: "140px" }}>
        <span style={{ fontSize: "10px", color: "#888", fontWeight: "600", textTransform: "uppercase", display: "block" }}>
          YOUR LOCATION
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ color: "#16a34a", fontSize: "12px" }}></span>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "#16a34a" }}>
            {selectedArea ? selectedArea.name : "SELECT AREA"}
          </span>
          <span style={{ fontSize: "11px", color: "#16a34a" }}>▼</span>
        </div>
        {selectedArea && (
          <span style={{ fontSize: "11px", color: "#888", display: "block" }}>{selectedArea.city}</span>
        )}
      </div>

      
      {isOpen && (
        <div style={{
          position: "absolute", top: "110%", left: 0,
          width: "380px", background: "white",
          borderRadius: "16px", boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          border: "1px solid #e5e7eb", zIndex: 9999, overflow: "hidden"
        }}>

          
          <div style={{
            padding: "14px 18px",
            background: "linear-gradient(135deg, #16a34a, #22c55e)",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}></span>
              <span style={{ color: "white", fontWeight: "700", fontSize: "15px" }}>
                Select Delivery Area
              </span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{
              background: "rgba(255,255,255,0.2)", border: "none",
              color: "white", width: "28px", height: "28px",
              borderRadius: "50%", cursor: "pointer", fontSize: "14px",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>✕</button>
          </div>

          <div style={{ padding: "14px" }}>

            
            <button onClick={handleGPS} disabled={gpsLoading} style={{
              width: "100%", padding: "11px 16px",
              background: gpsLoading ? "#e5e7eb" : "#f0fdf4",
              color: gpsLoading ? "#aaa" : "#16a34a",
              border: "1.5px solid #bbf7d0", borderRadius: "10px",
              cursor: gpsLoading ? "not-allowed" : "pointer",
              fontWeight: "600", fontSize: "13px",
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "8px", marginBottom: "12px"
            }}>
              <span style={{ fontSize: "16px" }}>{gpsLoading ? "" : ""}</span>
              {gpsLoading ? "Detecting your location..." : "Use My Current Location (GPS)"}
            </button>

            
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
              <span style={{ fontSize: "12px", color: "#aaa", fontWeight: "600" }}>OR</span>
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
            </div>

           
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 14px", border: "1.5px solid #e5e7eb",
              borderRadius: "10px", background: "#f9fafb", marginBottom: "12px"
            }}>
              <span style={{ fontSize: "16px" }}></span>
              <input
                type="text"
                placeholder="Search area or city..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  border: "none", outline: "none", fontSize: "14px",
                  width: "100%", background: "transparent", color: "#1a1a1a"
                }}
              />
              {searchText && (
                <button onClick={() => { setSearchText(""); setServiceStatus(null); setShowMap(false); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: "16px" }}>
                  ✕
                </button>
              )}
            </div>

            
            {searchText.length >= 2 && (
              <div style={{ marginBottom: "12px" }}>
                {filteredAreas.length === 0 ? (
                  <p style={{ margin: 0, fontSize: "13px", color: "#888", textAlign: "center", padding: "8px" }}>
                    No areas found for "{searchText}"
                  </p>
                ) : (
                  filteredAreas.map((area, i) => (
                    <div
                      key={area._id || i}
                      onClick={() => handleAreaSelect(area)}
                      style={{
                        padding: "10px 12px", borderRadius: "8px", cursor: "pointer",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        marginBottom: "4px", border: "1px solid #f0f0f0", background: "white"
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                      onMouseLeave={e => e.currentTarget.style.background = "white"}
                    >
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a1a" }}>
                         {area.name}, {area.city}
                      </span>
                      <span style={{
                        fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: "700",
                        background: area.serviceAvailable ? "#dcfce7" : "#fee2e2",
                        color: area.serviceAvailable ? "#16a34a" : "#dc2626"
                      }}>
                        {area.serviceAvailable ? "✓ Available" : "✗ Unavailable"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            
            {serviceStatus && (
              <div style={{
                padding: "12px 14px", borderRadius: "10px", marginBottom: "12px",
                background: serviceStatus.available ? "#dcfce7" : "#fee2e2",
                border: `1px solid ${serviceStatus.available ? "#bbf7d0" : "#fecaca"}`,
                display: "flex", alignItems: "center", gap: "10px"
              }}>
                <span style={{ fontSize: "24px" }}>
                  {serviceStatus.available ? "" : ""}
                </span>
                <div>
                  <p style={{
                    margin: 0, fontSize: "13px", fontWeight: "700",
                    color: serviceStatus.available ? "#15803d" : "#dc2626"
                  }}>
                    {serviceStatus.available ? "Service Available!" : "Service Not Available"}
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: serviceStatus.available ? "#16a34a" : "#ef4444" }}>
                    {serviceStatus.available
                      ? ` Delivering to ${serviceStatus.area?.name}, ${serviceStatus.area?.city}`
                      : "We don't deliver here yet."}
                  </p>
                </div>
              </div>
            )}

            
            {showMap && (
              <div>
                <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#666", fontWeight: "600" }}>
                   Your selected location:
                </p>
                <MapContainer
                  center={markerPos}
                  zoom={14}
                  style={{ width: "100%", height: "160px", borderRadius: "10px" }}
                  key={markerPos.join(",")}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={markerPos} />
                  <MapClickHandler onLocationSelect={checkServiceByCoords} />
                </MapContainer>
                
              </div>
            )}

          </div>

          
          {selectedArea && serviceStatus && (
            <div style={{
              padding: "12px 14px", borderTop: "1px solid #f0f0f0",
              background: selectedArea.serviceAvailable ? "#f0fdf4" : "#fff5f5"
            }}>
              {selectedArea.serviceAvailable ? (
                <button
                  onClick={handleConfirmDelivery}  
                  disabled={saving}
                  style={{
                    width: "100%", padding: "12px",
                    background: saving ? "#86efac" : "#16a34a",
                    color: "white", border: "none", borderRadius: "10px",
                    cursor: saving ? "not-allowed" : "pointer",
                    fontWeight: "700", fontSize: "14px",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                  }}>
                  {saving ? " Saving..." : ` Deliver to ${selectedArea.name}, ${selectedArea.city}`}
                </button>
              ) : (
                <div style={{ textAlign: "center", padding: "8px" }}>
                  <p style={{ margin: 0, fontSize: "13px", color: "#dc2626", fontWeight: "600" }}>
                    Select a different available area
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}