import { useEffect, useState } from "react";
import axios from "axios";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSignOutAlt, FaEdit, FaSave, FaShoppingBag, FaHeart, FaTimes } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

const Profile = () => {
  const storedUser = localStorage.getItem("user");
  const localUser = storedUser ? JSON.parse(storedUser) : null;
  const userId = localStorage.getItem("userId") || localUser?._id;

  const [user, setUser] = useState({
    name: localUser?.name || "",
    email: localUser?.email || "",
    phone: localUser?.mobile || localUser?.phone || "",
    address: localUser?.address || "",
  });
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    axios.get(`http://localhost:8081/api/users/${userId}`)
      .then(res => {
        setUser({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.mobile || res.data.phone || "",
          address: res.data.address || "",
        });
      }).catch(() => {});
  }, [userId]);

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(`http://localhost:8081/api/users/${userId}`, user);
      const updated = { ...localUser, ...user };
      localStorage.setItem("user", JSON.stringify(updated));
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    window.location.href = "/";
  };

  if (!localUser) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <div style={{ fontSize: "64px" }}>👤</div>
        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "700" }}>Not Logged In</h2>
        <p style={{ color: "#888", margin: 0 }}>Please login to view your profile</p>
        <button onClick={() => window.location.href = "/"} style={{ padding: "12px 32px", background: "#16a34a", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", padding: "32px 16px" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>

        {saved && (
          <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "12px 20px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", color: "#15803d", fontWeight: "600", fontSize: "14px" }}>
            ✅ Profile updated successfully!
          </div>
        )}

        <div style={{ background: "white", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", marginBottom: "20px" }}>
          <div style={{ background: "linear-gradient(135deg, #16a34a, #22c55e)", padding: "32px 24px", textAlign: "center", position: "relative" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "3px solid white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: "32px", fontWeight: "800", color: "white" }}>
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <h2 style={{ margin: 0, color: "white", fontSize: "20px", fontWeight: "800" }}>{user.name || "User"}</h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "6px" }}>
              <MdVerified color="white" size={16} />
              <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "13px" }}>Verified Member</span>
            </div>
          </div>

          <div style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#1a1a1a" }}>Personal Information</h3>
              {!editing ? (
                <button onClick={() => setEditing(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", color: "#16a34a", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                  <FaEdit size={13} /> Edit
                </button>
              ) : (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => setEditing(false)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", color: "#888", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                    <FaTimes size={13} /> Cancel
                  </button>
                  <button onClick={handleSave} disabled={loading} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "#16a34a", border: "none", borderRadius: "8px", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                    <FaSave size={13} /> {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>

            {[
              { name: "name", label: "Full Name", icon: <FaUser size={14} color="#16a34a" />, type: "text" },
              { name: "email", label: "Email Address", icon: <FaEnvelope size={14} color="#16a34a" />, type: "email" },
              { name: "phone", label: "Phone Number", icon: <FaPhone size={14} color="#16a34a" />, type: "tel" },
              { name: "address", label: "Address", icon: <FaMapMarkerAlt size={14} color="#16a34a" />, type: "text" },
            ].map(({ name, label, icon, type }) => (
              <div key={name} style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>{label}</label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", border: editing ? "1.5px solid #16a34a" : "1.5px solid #f0f0f0", borderRadius: "10px", background: editing ? "#f0fdf4" : "#f9fafb", transition: "all 0.2s" }}>
                  {icon}
                  {editing ? (
                    <input name={name} type={type} value={user[name]} onChange={handleChange}
                      style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "14px", color: "#1a1a1a", fontWeight: "500" }} />
                  ) : (
                    <span style={{ fontSize: "14px", color: user[name] ? "#1a1a1a" : "#aaa", fontWeight: "500" }}>
                      {user[name] || `Add ${label}`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: "20px" }}>
          {[
            { icon: <FaShoppingBag size={16} color="#16a34a" />, label: "My Orders", sub: "View your order history", path: "/orders" },
            { icon: <FaHeart size={16} color="#dc2626" />, label: "Wishlist", sub: "Your saved items", path: "/wishlist" },
            { icon: <FaMapMarkerAlt size={16} color="#f59e0b" />, label: "Saved Addresses", sub: "Manage delivery addresses", path: "/addresses" },
          ].map((item, i) => (
            <div key={i} onClick={() => window.location.href = item.path}
              style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px", borderBottom: i < 2 ? "1px solid #f5f5f5" : "none", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
              onMouseLeave={e => e.currentTarget.style.background = "white"}
            >
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1a1a1a" }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>{item.sub}</p>
              </div>
              <span style={{ color: "#aaa", fontSize: "18px" }}>›</span>
            </div>
          ))}
        </div>

        <button onClick={handleLogout} style={{ width: "100%", padding: "14px", background: "white", color: "#dc2626", border: "1.5px solid #fecaca", borderRadius: "14px", fontSize: "15px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <FaSignOutAlt size={16} /> Logout
        </button>

      </div>
    </div>
  );
};

export default Profile;
