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
    <div ref={dropdownRef} className="area-dropdown-wrapper">

      {/* Trigger Button */}
      <div onClick={() => setIsOpen(!isOpen)} className="area-dropdown-trigger">
        <span className="area-dropdown-label">YOUR LOCATION</span>
        <div className="area-dropdown-display">
          <span className="area-dropdown-location-icon"></span>
          <span className="area-dropdown-text">
            {selectedArea ? selectedArea.name : "SELECT AREA"}
          </span>
          <span className="area-dropdown-arrow">▼</span>
        </div>
        {selectedArea && (
          <span className="area-dropdown-city">{selectedArea.city}</span>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="area-dropdown-menu">

          {/* Header */}
          <div className="area-dropdown-header">
            <div className="area-dropdown-header-content">
              <span className="area-dropdown-header-icon"></span>
              <span className="area-dropdown-header-title">
                Select Delivery Area
              </span>
            </div>
            <button onClick={() => setIsOpen(false)} className="area-dropdown-close-btn">
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="area-dropdown-body">

            {/* GPS Button */}
            <button onClick={handleGPS} disabled={gpsLoading} className="area-gps-btn">
              <span className="area-gps-icon">{gpsLoading ? "" : ""}</span>
              {gpsLoading ? "Detecting your location..." : "Use My Current Location (GPS)"}
            </button>

            {/* Divider */}
            <div className="area-dropdown-divider">
              <div className="area-dropdown-divider-line" />
              <span className="area-dropdown-divider-text">OR</span>
              <div className="area-dropdown-divider-line" />
            </div>

            {/* Search Input */}
            <div className="area-search-container">
              <span className="area-search-icon"></span>
              <input
                type="text"
                placeholder="Search area or city..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="area-search-input"
              />
              {searchText && (
                <button onClick={() => { setSearchText(""); setServiceStatus(null); setShowMap(false); }}
                  className="area-search-clear-btn">
                  ✕
                </button>
              )}
            </div>

            {/* Results List */}
            {searchText.length >= 2 && (
              <div className="area-results-list">
                {filteredAreas.length === 0 ? (
                  <p className="area-no-results">
                    No areas found for "{searchText}"
                  </p>
                ) : (
                  filteredAreas.map((area, i) => (
                    <div
                      key={area._id || i}
                      onClick={() => handleAreaSelect(area)}
                      className="area-result-item"
                    >
                      <span className="area-result-name">
                         {area.name}, {area.city}
                      </span>
                      <span className={`area-result-badge ${area.serviceAvailable ? "available" : "unavailable"}`}>
                        {area.serviceAvailable ? "✓ Available" : "✗ Unavailable"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Service Status */}
            {serviceStatus && (
              <div className={`area-service-status ${serviceStatus.available ? "available" : "unavailable"}`}>
                <span className="area-service-icon">
                  {serviceStatus.available ? "" : ""}
                </span>
                <div className="area-service-content">
                  <p className={`area-service-title ${serviceStatus.available ? "available" : "unavailable"}`}>
                    {serviceStatus.available ? "Service Available!" : "Service Not Available"}
                  </p>
                  <p className={`area-service-description ${serviceStatus.available ? "available" : "unavailable"}`}>
                    {serviceStatus.available
                      ? ` Delivering to ${serviceStatus.area?.name}, ${serviceStatus.area?.city}`
                      : "We don't deliver here yet."}
                  </p>
                </div>
              </div>
            )}

            {/* Map Section */}
            {showMap && (
              <div className="area-map-section">
                <p className="area-map-label">
                   Your selected location:
                </p>
                <MapContainer
                  center={markerPos}
                  zoom={14}
                  className="area-map-container"
                  key={markerPos.join(",")}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={markerPos} />
                  <MapClickHandler onLocationSelect={checkServiceByCoords} />
                </MapContainer>
              </div>
            )}

          </div>

          {/* Footer */}
          {selectedArea && serviceStatus && (
            <div className={`area-dropdown-footer ${selectedArea.serviceAvailable ? "available" : "unavailable"}`}>
              {selectedArea.serviceAvailable ? (
                <button
                  onClick={handleConfirmDelivery}
                  disabled={saving}
                  className="area-confirm-btn"
                >
                  {saving ? " Saving..." : ` Deliver to ${selectedArea.name}, ${selectedArea.city}`}
                </button>
              ) : (
                <div className="area-unavailable-message">
                  <p>Select a different available area</p>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}