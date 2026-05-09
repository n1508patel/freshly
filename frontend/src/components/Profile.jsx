import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaSignOutAlt, FaEdit, FaSave, FaShoppingBag, FaHeart, FaTimes,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";

const Profile = () => {
  const storedUser = localStorage.getItem("user");
  const localUser  = storedUser ? JSON.parse(storedUser) : null;
  const userId     = localStorage.getItem("userId") || localUser?._id;

  const [user,    setUser]    = useState({
    name:    localUser?.name    || "",
    email:   localUser?.email   || "",
    phone:   localUser?.mobile  || localUser?.phone || "",
    address: localUser?.address || "",
  });
  const [editing, setEditing] = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    axios.get(`http://localhost:8081/api/users/${userId}`)
      .then(res => {
        setUser({
          name:    res.data.name    || "",
          email:   res.data.email   || "",
          phone:   res.data.mobile  || res.data.phone || "",
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

  /* ── Not logged in ── */
  if (!localUser) {
    return (
      <div className="profile-guest">
        <div className="profile-guest-icon">👤</div>
        <h2 className="profile-guest-title">Not Logged In</h2>
        <p className="profile-guest-sub">Please login to view your profile</p>
        <button className="profile-guest-btn" onClick={() => window.location.href = "/"}>
          Go to Home
        </button>
      </div>
    );
  }

  const fields = [
    { name: "name",    label: "Full Name",      icon: <FaUser        size={14} color="#16a34a" />, type: "text"  },
    { name: "email",   label: "Email Address",  icon: <FaEnvelope    size={14} color="#16a34a" />, type: "email" },
    { name: "phone",   label: "Phone Number",   icon: <FaPhone       size={14} color="#16a34a" />, type: "tel"   },
    { name: "address", label: "Address",        icon: <FaMapMarkerAlt size={14} color="#16a34a" />, type: "text" },
  ];

  const menuItems = [
    { icon: <FaShoppingBag size={16} color="#16a34a" />, label: "My Orders",        sub: "View your order history",      path: "/orders"    },
    { icon: <FaHeart       size={16} color="#dc2626" />, label: "Wishlist",          sub: "Your saved items",             path: "/wishlist"  },
    { icon: <FaMapMarkerAlt size={16} color="#f59e0b" />, label: "Saved Addresses", sub: "Manage delivery addresses",    path: "/addresses" },
  ];

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* ── Success Toast ── */}
        {saved && (
          <div className="profile-toast">
             Profile updated successfully!
          </div>
        )}

        {/* ── Profile Card ── */}
        <div className="profile-card">

          {/* Banner */}
          <div className="profile-banner">
            <div className="profile-avatar">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <h2 className="profile-banner-name">{user.name || "User"}</h2>
            <div className="profile-verified">
              <MdVerified color="white" size={16} />
              <span className="profile-verified-text">Verified Member</span>
            </div>
          </div>

          {/* Form Area */}
          <div className="profile-form-area">
            <div className="profile-form-header">
              <h3 className="profile-form-title">Personal Information</h3>
              {!editing ? (
                <button className="profile-btn-edit" onClick={() => setEditing(true)}>
                  <FaEdit size={13} /> Edit
                </button>
              ) : (
                <div className="profile-edit-actions">
                  <button className="profile-btn-cancel" onClick={() => setEditing(false)}>
                    <FaTimes size={13} /> Cancel
                  </button>
                  <button className="profile-btn-save" onClick={handleSave} disabled={loading}>
                    <FaSave size={13} /> {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>

            {fields.map(({ name, label, icon, type }) => (
              <div key={name} className="profile-field">
                <label className="profile-field-label">{label}</label>
                <div className={`profile-field-row ${editing ? "profile-field-row--editing" : ""}`}>
                  {icon}
                  {editing ? (
                    <input
                      name={name}
                      type={type}
                      value={user[name]}
                      onChange={handleChange}
                      className="profile-field-input"
                    />
                  ) : (
                    <span className={`profile-field-value ${!user[name] ? "profile-field-value--empty" : ""}`}>
                      {user[name] || `Add ${label}`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Menu Card ── */}
        <div className="profile-menu-card">
          {menuItems.map((item, i) => (
            <div
              key={i}
              className={`profile-menu-item ${i < menuItems.length - 1 ? "profile-menu-item--bordered" : ""}`}
              onClick={() => window.location.href = item.path}
            >
              <div className="profile-menu-icon-wrap">{item.icon}</div>
              <div className="profile-menu-text">
                <p className="profile-menu-label">{item.label}</p>
                <p className="profile-menu-sub">{item.sub}</p>
              </div>
              <span className="profile-menu-arrow">›</span>
            </div>
          ))}
        </div>

        {/* ── Logout ── */}
        <button className="profile-logout-btn" onClick={handleLogout}>
          <FaSignOutAlt size={16} /> Logout
        </button>

      </div>
    </div>
  );
};

export default Profile;