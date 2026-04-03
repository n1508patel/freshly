// frontend/src/components/AreaDropdown/index.jsx
import { useState, useEffect, useRef } from "react";
import { FaAngleDown, FaMapMarkerAlt, FaTimes, FaPlus, FaTrash, FaCrosshairs } from "react-icons/fa";
import axios from "axios";
import "./AreaDropdown.css";

const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"; // 🔑 Replace with your key

// Load Google Maps script once
const loadGoogleMaps = () => {
  return new Promise((resolve) => {
    if (window.google && window.google.maps) return resolve();
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.onload = resolve;
    document.head.appendChild(script);
  });
};

// Reverse geocode lat/lng → address string
const reverseGeocode = async (lat, lng) => {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
  );
  const data = await res.json();
  if (data.results && data.results[0]) {
    return data.results[0].formatted_address;
  }
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
};

// Geocode pincode → address + lat/lng
const geocodePincode = async (pincode) => {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=${GOOGLE_MAPS_API_KEY}`
  );
  const data = await res.json();
  if (data.results && data.results[0]) {
    const { lat, lng } = data.results[0].geometry.location;
    return { fullAddress: data.results[0].formatted_address, lat, lng };
  }
  return null;
};

const AreaDropdown = () => {
  const [open, setOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState({ label: "Your Location", fullAddress: "Select location" });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [pincode, setPincode] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 21.1702, lng: 72.8311 }); // default Surat
  const [markerPos, setMarkerPos] = useState(null);
  const [newLabel, setNewLabel] = useState("Home");
  const [saving, setSaving] = useState(false);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const dropdownRef = useRef(null);
  const autocompleteRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch saved addresses from MongoDB
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get("http://localhost:8081/api/addresses");
      setSavedAddresses(data);
      if (data.length > 0) {
        setSelectedAddress(data[0]);
      }
    } catch (err) {
      console.log("Could not fetch addresses:", err);
    }
  };

  // Load Google Maps when panel opens
  useEffect(() => {
    if (open && showMap && !mapLoaded) {
      loadGoogleMaps().then(() => {
        setMapLoaded(true);
      });
    }
  }, [open, showMap]);

  // Init map after script loaded
  useEffect(() => {
    if (mapLoaded && showMap && mapRef.current && !mapInstanceRef.current) {
      initMap();
    }
  }, [mapLoaded, showMap]);

  // Init autocomplete on search input
  useEffect(() => {
    if (mapLoaded && searchInputRef.current && !autocompleteRef.current) {
      const ac = new window.google.maps.places.Autocomplete(searchInputRef.current);
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (place.geometry) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          setMapCenter({ lat, lng });
          setMarkerPos({ lat, lng, fullAddress: place.formatted_address });
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter({ lat, lng });
            placeMarker({ lat, lng }, place.formatted_address);
          }
        }
      });
      autocompleteRef.current = ac;
    }
  }, [mapLoaded, showMap]);

  const initMap = () => {
    const map = new window.google.maps.Map(mapRef.current, {
      center: mapCenter,
      zoom: 14,
      disableDefaultUI: true,
      zoomControl: true,
    });
    mapInstanceRef.current = map;

    // Click on map to drop pin
    map.addListener("click", async (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const fullAddress = await reverseGeocode(lat, lng);
      placeMarker({ lat, lng }, fullAddress);
    });
  };

  const placeMarker = (pos, fullAddress) => {
    if (markerRef.current) markerRef.current.setMap(null);
    const marker = new window.google.maps.Marker({
      position: pos,
      map: mapInstanceRef.current,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
    });
    markerRef.current = marker;
    setMarkerPos({ ...pos, fullAddress });

    marker.addListener("dragend", async (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const addr = await reverseGeocode(lat, lng);
      setMarkerPos({ lat, lng, fullAddress: addr });
    });
  };

  // GPS detect location
  const handleGPS = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const fullAddress = await reverseGeocode(lat, lng);
        setSelectedAddress({ label: "Current Location", fullAddress, lat, lng });
        setMapCenter({ lat, lng });
        setGpsLoading(false);
        setOpen(false);
      },
      () => {
        setGpsLoading(false);
        alert("Could not get your location. Please allow location access.");
      }
    );
  };

  // Pincode search
  const handlePincodeSearch = async () => {
    if (pincode.length < 4) return setPincodeError("Enter a valid pincode");
    setPincodeError("");
    const result = await geocodePincode(pincode);
    if (result) {
      setSelectedAddress({ label: "Pincode", fullAddress: result.fullAddress, ...result });
      setMapCenter({ lat: result.lat, lng: result.lng });
      setOpen(false);
    } else {
      setPincodeError("Pincode not found");
    }
  };

  // Save address to MongoDB
  const handleSaveAddress = async () => {
    if (!markerPos) return alert("Please pin a location on the map first");
    setSaving(true);
    try {
      const payload = {
        label: newLabel,
        fullAddress: markerPos.fullAddress,
        lat: markerPos.lat,
        lng: markerPos.lng,
      };
      await axios.post("http://localhost:8081/api/addresses", payload);
      await fetchAddresses();
      setSelectedAddress(payload);
      setShowMap(false);
      setOpen(false);
    } catch (err) {
      alert("Failed to save address");
    }
    setSaving(false);
  };

  // Delete saved address
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`http://localhost:8081/api/addresses/${id}`);
      await fetchAddresses();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  // Short display name for header button
  const displayName = selectedAddress?.fullAddress?.split(",")[0] || "Select location";

  return (
    <div className="areaDropdown" ref={dropdownRef}>
      {/* Trigger Button */}
      <button className="areaDrop" onClick={() => setOpen((o) => !o)}>
        <FaMapMarkerAlt className="locationIcon" />
        <div className="info d-flex flex-column">
          <span className="label">Your Location</span>
          <span className="name">{displayName}</span>
        </div>
        <FaAngleDown className={`arrow ${open ? "rotated" : ""}`} />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="locationPanel">
          <div className="panelHeader">
            <h6>Choose Delivery Location</h6>
            <button className="closeBtn" onClick={() => setOpen(false)}><FaTimes /></button>
          </div>

          {/* GPS */}
          <button className="gpsBtn" onClick={handleGPS} disabled={gpsLoading}>
            <FaCrosshairs /> {gpsLoading ? "Detecting..." : "Use my current location"}
          </button>

          {/* Pincode */}
          <div className="pincodeRow">
            <input
              type="text"
              placeholder="Enter pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePincodeSearch()}
              maxLength={10}
            />
            <button onClick={handlePincodeSearch}>Search</button>
          </div>
          {pincodeError && <p className="errorText">{pincodeError}</p>}

          {/* Saved Addresses from MongoDB */}
          {savedAddresses.length > 0 && (
            <div className="savedSection">
              <p className="sectionLabel">Saved Addresses</p>
              {savedAddresses.map((addr) => (
                <div
                  key={addr._id}
                  className={`addressItem ${selectedAddress?._id === addr._id ? "active" : ""}`}
                  onClick={() => { setSelectedAddress(addr); setOpen(false); }}
                >
                  <div className="addrInfo">
                    <span className="addrLabel">{addr.label}</span>
                    <span className="addrText">{addr.fullAddress}</span>
                  </div>
                  <button className="deleteBtn" onClick={(e) => handleDelete(addr._id, e)}>
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Address via Map */}
          <button className="addNewBtn" onClick={() => { setShowMap((s) => !s); loadGoogleMaps().then(() => setMapLoaded(true)); }}>
            <FaPlus /> {showMap ? "Hide Map" : "Add New Address"}
          </button>

          {showMap && (
            <div className="mapSection">
              {/* Search input for autocomplete */}
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search area, street..."
                className="mapSearchInput"
              />

              {/* Label selector */}
              <div className="labelRow">
                {["Home", "Work", "Other"].map((l) => (
                  <button
                    key={l}
                    className={`labelBtn ${newLabel === l ? "active" : ""}`}
                    onClick={() => setNewLabel(l)}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {/* Google Map */}
              <div ref={mapRef} className="googleMap" />

              {markerPos && (
                <div className="selectedAddr">
                  <FaMapMarkerAlt /> {markerPos.fullAddress}
                </div>
              )}

              <button className="saveBtn" onClick={handleSaveAddress} disabled={saving}>
                {saving ? "Saving..." : "Save This Address"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AreaDropdown;