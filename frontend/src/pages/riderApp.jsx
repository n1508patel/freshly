 import { useState, useEffect } from "react";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { FaMotorcycle } from "react-icons/fa";

const API = "http://localhost:8081/api";

const STATUS_FLOW = [
  { key: "assigned",   label: "Order Assigned", icon: ReceiptIcon,       color: "#6366f1", bg: "#eef2ff" },
  { key: "picked",     label: "Picked Up",       icon: FaMotorcycle,      color: "#f59e0b", bg: "#fff7ed" },
  { key: "on_the_way", label: "On the Way",      icon: LocalShippingIcon, color: "#0ea5e9", bg: "#e0f2fe" },
  { key: "delivered",  label: "Delivered",       icon: CheckCircleIcon,   color: "#16a34a", bg: "#dcfce7" },
];

export default function RiderApp() {
  const [screen,    setScreen]    = useState("login");
  const [rider,     setRider]     = useState(null);
  const [order,     setOrder]     = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [phone,     setPhone]     = useState("");
  const [password,  setPassword]  = useState("");
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [updating,  setUpdating]  = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("rider");
    if (saved) {
      setRider(JSON.parse(saved));
      setScreen("dashboard");
    }
  }, []);

  useEffect(() => {
    if (screen === "dashboard" && rider) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [screen, rider]);

  const fetchOrders = async () => {
    try {
      const res  = await fetch(`${API}/riders/order/${rider._id}`);
      const data = await res.json();
      if (data.order) setOrder(data.order);

      const res2  = await fetch(`${API}/riders/available-orders`);
      const data2 = await res2.json();
      setAllOrders(data2);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async () => {
    if (!phone || !password) return setError("Enter phone and password");
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${API}/riders/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Login failed");
      setRider(data.rider);
      localStorage.setItem("rider", JSON.stringify(data.rider));
      setScreen("dashboard");
    } catch (err) {
      setError("Server error. Is backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/riders/auto-assign/${orderId}`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setAllOrders([]);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to accept order");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const res  = await fetch(`${API}/riders/update-status/${order._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, riderId: rider._id }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        if (newStatus === "delivered") {
          setTimeout(() => { setOrder(null); setScreen("dashboard"); }, 2000);
        }
      }
    } catch (err) {
      setError("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("rider");
    setRider(null);
    setOrder(null);
    setScreen("login");
  };

  const getCurrentStatusIndex = () => STATUS_FLOW.findIndex(s => s.key === order?.status);
  const getNextStatus = () => {
    const idx = getCurrentStatusIndex();
    return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  // ── LOGIN ──
  if (screen === "login") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ width: "100%", maxWidth: "400px", backgroundColor: "white", borderRadius: "24px", padding: "40px 32px", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "20px", backgroundColor: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <FaMotorcycle style={{ fontSize: "36px", color: "white" }} />
            </div>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#1a1a1a" }}>Freshly Rider</h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>Delivery Partner App</p>
          </div>

          {error && (
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontSize: "13px", color: "#dc2626" }}>
               {error}
            </div>
          )}

          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "#666", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Phone Number</label>
            <div style={{ position: "relative" }}>
              <PhoneIcon style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", color: "#aaa" }} />
              <input
                placeholder="+91 9876543210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{ width: "100%", padding: "12px 12px 12px 38px", border: "1px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "#666", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ width: "100%", padding: "12px 14px", border: "1px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: "100%", padding: "14px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "14px", fontSize: "15px", fontWeight: "700", cursor: "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Logging in..." : "Login as Rider "}
          </button>

          <p style={{ textAlign: "center", fontSize: "11px", color: "#aaa", marginTop: "20px" }}>
            Contact admin to get your login credentials
          </p>
        </div>
      </div>
    );
  }

  // ── DASHBOARD ──
  if (screen === "dashboard") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
        <div style={{ backgroundColor: "#16a34a", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PersonIcon style={{ color: "white", fontSize: "22px" }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "white" }}>{rider?.name}</p>
              <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.8)" }}>{rider?.phone}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#86efac" }} />
            <span style={{ fontSize: "12px", color: "white", fontWeight: "600" }}>Online</span>
            <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", marginLeft: "8px" }}>
              <LogoutIcon style={{ color: "white", fontSize: "20px" }} />
            </button>
          </div>
        </div>

        <div style={{ padding: "20px" }}>
          {order && order.status !== "delivered" ? (
            <div>
              <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: "700", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Current Order</p>
              <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", border: "2px solid #bbf7d0" }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#1a1a1a" }}>#{order.orderNo}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#888" }}>{new Date(order.createdAt).toLocaleTimeString()}</p>
                  </div>
                  <div style={{ backgroundColor: "#dcfce7", borderRadius: "20px", padding: "4px 12px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a" }}>${order.total?.toFixed(2)}</span>
                  </div>
                </div>

                {/* STATUS PROGRESS */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    {STATUS_FLOW.map((s, i) => {
                      const idx  = getCurrentStatusIndex();
                      const done = i <= idx;
                      return (
                        <div key={s.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flex: 1 }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: done ? s.color : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
                            <s.icon style={{ fontSize: "15px", color: done ? "white" : "#aaa" }} />
                          </div>
                          <span style={{ fontSize: "9px", fontWeight: "600", color: done ? s.color : "#aaa", textAlign: "center" }}>{s.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ height: "4px", backgroundColor: "#e5e7eb", borderRadius: "2px", marginTop: "4px" }}>
                    <div style={{ height: "100%", backgroundColor: "#16a34a", borderRadius: "2px", width: `${(getCurrentStatusIndex() / (STATUS_FLOW.length - 1)) * 100}%`, transition: "width 0.5s" }} />
                  </div>
                </div>

                {/* ADDRESS */}
                <div style={{ backgroundColor: "#f9fafb", borderRadius: "12px", padding: "12px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <LocationOnIcon style={{ fontSize: "18px", color: "#16a34a", flexShrink: 0, marginTop: "1px" }} />
                    <div>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: "#1a1a1a" }}>{order.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#666" }}>{order.address}{order.city ? `, ${order.city}` : ""}{order.pincode ? ` - ${order.pincode}` : ""}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                    <PhoneIcon style={{ fontSize: "14px", color: "#16a34a" }} />
                    <a href={`tel:${order.phone}`} style={{ fontSize: "13px", color: "#16a34a", fontWeight: "600", textDecoration: "none" }}>{order.phone}</a>
                  </div>
                </div>

                {/* ITEMS */}
                <div style={{ marginBottom: "16px" }}>
                  <p style={{ margin: "0 0 8px", fontSize: "11px", fontWeight: "700", color: "#888", textTransform: "uppercase" }}>Items ({order.items?.length || 0})</p>
                  {order.items?.slice(0, 3).map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                      <span style={{ fontSize: "13px", color: "#1a1a1a" }}>{item.name}</span>
                      <span style={{ fontSize: "12px", color: "#888" }}>x{item.qty} · ${item.price}</span>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#aaa" }}>+{order.items.length - 3} more items</p>
                  )}
                </div>

                {/* ACTION BUTTON */}
                {(() => {
                  const next = getNextStatus();
                  if (!next) return null;
                  const NextIcon = next.icon;
                  return (
                    <button
                      onClick={() => handleUpdateStatus(next.key)}
                      disabled={updating}
                      style={{ width: "100%", padding: "14px", backgroundColor: next.color, color: "white", border: "none", borderRadius: "14px", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: updating ? 0.7 : 1 }}
                    >
                      <NextIcon style={{ fontSize: "18px" }} />
                      {updating ? "Updating..." : `Mark as ${next.label}`}
                    </button>
                  );
                })()}

                {order.status === "delivered" && (
                  <div style={{ textAlign: "center", padding: "14px", backgroundColor: "#dcfce7", borderRadius: "14px" }}>
                    <CheckCircleIcon style={{ color: "#16a34a", fontSize: "32px" }} />
                    <p style={{ margin: "4px 0 0", fontWeight: "700", color: "#16a34a" }}>Delivered Successfully! 🎉</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ backgroundColor: "#f0fdf4", borderRadius: "16px", padding: "20px", textAlign: "center", marginBottom: "24px", border: "1px solid #bbf7d0" }}>
                <FaMotorcycle style={{ fontSize: "48px", color: "#16a34a" }} />
                <p style={{ margin: "8px 0 4px", fontSize: "16px", fontWeight: "700", color: "#15803d" }}>Ready for Delivery!</p>
                <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>You have no active order right now</p>
              </div>

              <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: "700", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Available Orders ({allOrders.length})
              </p>

              {allOrders.length === 0 ? (
                <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "30px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <AccessTimeIcon style={{ fontSize: "40px", color: "#ccc" }} />
                  <p style={{ margin: "8px 0 0", color: "#aaa", fontSize: "14px" }}>No orders available right now</p>
                  <p style={{ margin: "4px 0 0", color: "#ccc", fontSize: "12px" }}>Refreshing every 10 seconds...</p>
                </div>
              ) : (
                allOrders.map(o => (
                  <div key={o._id} style={{ backgroundColor: "white", borderRadius: "16px", padding: "16px", marginBottom: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1a1a1a" }}>#{o.orderNo}</p>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#16a34a" }}>${o.total?.toFixed(2)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                      <LocationOnIcon style={{ fontSize: "14px", color: "#888" }} />
                      <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>{o.address}{o.city ? `, ${o.city}` : ""}</p>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", color: "#aaa" }}>{o.items?.length || 0} items · {new Date(o.createdAt).toLocaleTimeString()}</span>
                      <button
                        onClick={() => handleAcceptOrder(o._id)}
                        disabled={loading}
                        style={{ padding: "8px 20px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "20px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
                      >
                        Accept 🛵
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}