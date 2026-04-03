import { useState, useEffect, useRef } from "react";
import CloseIcon from "@mui/icons-material/Close";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PaymentIcon from "@mui/icons-material/Payment";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import LockIcon from "@mui/icons-material/Lock";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { FaMobileAlt, FaCreditCard, FaUniversity, FaMoneyBillWave } from "react-icons/fa";
import { useCart } from "../../context/CartContext";

const API = "http://localhost:8081/api";

const PAYMENT_METHODS = [
  { id: "upi",        label: "UPI",                Icon: FaMobileAlt,     desc: "Google Pay, PhonePe, Paytm", color: "#6366f1" },
  { id: "card",       label: "Credit / Debit Card", Icon: FaCreditCard,    desc: "Visa, Mastercard, Rupay",    color: "#0ea5e9" },
  { id: "netbanking", label: "Net Banking",          Icon: FaUniversity,    desc: "All major banks supported",  color: "#f59e0b" },
  { id: "cod",        label: "Cash on Delivery",     Icon: FaMoneyBillWave, desc: "Pay when order arrives",     color: "#16a34a" },
];

const STEPS = [
  { label: "Address",  Icon: LocationOnIcon },
  { label: "Payment",  Icon: PaymentIcon },
  { label: "Tracking", Icon: TrackChangesIcon },
];

// Map backend order status → trackingStep number
const STATUS_TO_STEP = {
  confirmed:   1,
  assigned:    1,
  picked:      2,
  on_the_way:  3,
  delivered:   4,
};

export default function CheckoutModal({ total, onClose, onSuccess }) {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const { cart, clearCart } = useCart();

  const [step,         setStep]         = useState(1);
  const [trackingStep, setTrackingStep] = useState(0);
  const [address, setAddress] = useState({
    name:    user?.name    || "",
    phone:   user?.mobile  || user?.phone || "",
    email:   user?.email   || "",
    addr:    user?.address || "",
    city:    "",
    pincode: "",
  });
  const [payMethod,  setPayMethod]  = useState("upi");
  const [upiId,      setUpiId]      = useState("");
  const [cardNo,     setCardNo]     = useState("");
  const [expiry,     setExpiry]     = useState("");
  const [cvv,        setCvv]        = useState("");
  const [processing, setProcessing] = useState(false);
  const [savedOrderId, setSavedOrderId] = useState(null);
  const [riderInfo,    setRiderInfo]    = useState(null); // { name, phone }
  const pollRef = useRef(null);

  const [orderNo] = useState(() => "FRE" + Math.floor(Math.random() * 900000 + 100000));

  // ── Poll order status from backend every 5s ──
  const startPolling = (orderId) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`${API}/orders/status/${orderId}`);
        const data = await res.json();
        if (data.order) {
          const newStep = STATUS_TO_STEP[data.order.status] || 1;
          setTrackingStep(newStep);

          // Set rider info if assigned
          if (data.order.riderName) {
            setRiderInfo({ name: data.order.riderName, phone: data.order.riderPhone });
          }

          // Stop polling when delivered
          if (data.order.status === "delivered") {
            clearInterval(pollRef.current);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 5000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const handlePayment = () => {
    setProcessing(true);
    setTimeout(async () => {
      setProcessing(false);
      setStep(3);
      setTrackingStep(1); // Order Confirmed

      try {
        const userData  = user || {};
        const cartItems = cart.map(item => ({
          _id:      item._id,
          name:     item.name,
          price:    item.price,
          qty:      item.qty,
          image:    item.imgs?.[0] || item.image || "",
          brand:    item.brand || "",
          category: item.category || "",
        }));

        const res = await fetch(`${API}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderNo,
            user:      userData._id,
            name:      address.name,
            phone:     address.phone,
            email:     address.email,
            address:   address.addr,
            city:      address.city,
            pincode:   address.pincode,
            payMethod,
            total,
            items:     cartItems,
            status:    "confirmed",
          }),
        });
        const data = await res.json();
        console.log("Order saved:", data);

        if (data._id) {
          setSavedOrderId(data._id);
          // Start polling real status
          startPolling(data._id);

          // Auto-assign rider
          await fetch(`${API}/riders/auto-assign/${data._id}`, { method: "POST" });
        }

        // Clear cart after order placed
        if (clearCart) clearCart();

      } catch (err) {
        console.error(" Order save failed:", err);
      }

      // Browser notifications
      if ("Notification" in window) {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification("🎉 Order Confirmed - Freshly", {
              body: `Order #${orderNo} placed! Total: $${total.toFixed(2)}`,
              icon: "/favicon.ico",
            });
          }
        });
      }
    }, 2000);
  };

  const fields = [
    { key: "name",    label: "Full Name",     placeholder: "Enter your full name",     Icon: PersonIcon },
    { key: "phone",   label: "Phone",          placeholder: "Enter phone number",       Icon: PhoneIcon },
    { key: "email",   label: "Email",          placeholder: "Enter email address",      Icon: EmailIcon },
    { key: "addr",    label: "Street Address", placeholder: "Street address, landmark", Icon: HomeIcon },
    { key: "city",    label: "City",           placeholder: "City",                     Icon: LocationOnIcon },
    { key: "pincode", label: "Pincode",        placeholder: "6-digit pincode",          Icon: LockIcon },
  ];

  const isPreFilled = (key) => address[key] && ["name","phone","email"].includes(key);

  const mapQuery = encodeURIComponent(
    [address.addr, address.city, address.pincode, "Gujarat", "India"].filter(Boolean).join(", ")
  );

  const TRACKING = [
    { Icon: CheckCircleIcon,   label: "Order Confirmed",  time: "Just now",  step: 1, color: "#16a34a" },
    { Icon: CheckCircleIcon,   label: "Being Prepared",   time: "~5 mins",   step: 2, color: "#16a34a" },
    { Icon: LocalShippingIcon, label: "Out for Delivery", time: "~20 mins",  step: 3, color: "#f59e0b" },
    { Icon: HomeIcon,          label: "Delivered",        time: "~35 mins",  step: 4, color: "#16a34a" },
  ];

  // Rider display info
  const riderName  = riderInfo?.name  || "Ravi Kumar";
  const riderPhone = riderInfo?.phone || "";

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1100 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "600px", maxHeight: "calc(100vh - 160px)",
        backgroundColor: "white", borderRadius: "20px",
        zIndex: 1101, overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
        display: "flex", flexDirection: "column",
      }}>

        {/* STEP HEADER */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", backgroundColor: "#f9fafb", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {STEPS.map((s, i) => {
                const num = i + 1;
                const done = step > num;
                const active = step === num;
                return (
                  <div key={num} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: done ? "#16a34a" : active ? "#1e3a5f" : "#e5e7eb", color: done || active ? "white" : "#aaa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", transition: "all 0.3s" }}>
                        {done ? <CheckCircleIcon style={{ fontSize: "16px" }} /> : num}
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: done ? "#16a34a" : active ? "#1e3a5f" : "#aaa" }}>{s.label}</span>
                    </div>
                    {i < 2 && <div style={{ width: "28px", height: "2px", margin: "0 6px", backgroundColor: step > num ? "#16a34a" : "#e5e7eb", transition: "background 0.3s" }} />}
                  </div>
                );
              })}
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", display: "flex" }}>
              <CloseIcon fontSize="small" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div style={{ overflowY: "auto", flex: 1, padding: "20px" }}>

          {/* STEP 1: ADDRESS */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1a1a1a" }}>
                <LocationOnIcon style={{ fontSize: "17px", color: "#16a34a", verticalAlign: "middle", marginRight: "4px" }} />
                Delivery Address
              </h3>
              {user && (
                <div style={{ backgroundColor: "#f0fdf4", borderRadius: "12px", padding: "10px 14px", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "#16a34a", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "700", flexShrink: 0 }}>
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: "#15803d" }}>{user.name}</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#16a34a" }}>{user.email} · {user.mobile || user.phone}</p>
                  </div>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {fields.map(({ key, label, placeholder, Icon }) => (
                  <div key={key} style={{ gridColumn: key === "addr" ? "1 / -1" : "auto" }}>
                    <label style={{ fontSize: "10px", fontWeight: "700", color: "#666", display: "block", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
                    <div style={{ position: "relative" }}>
                      <Icon style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", color: isPreFilled(key) ? "#16a34a" : "#ccc" }} />
                      <input placeholder={placeholder} value={address[key]} onChange={(e) => setAddress({ ...address, [key]: e.target.value })}
                        style={{ padding: "9px 10px 9px 30px", border: isPreFilled(key) ? "1px solid #bbf7d0" : "1px solid #e5e7eb", borderRadius: "10px", fontSize: "13px", outline: "none", width: "100%", boxSizing: "border-box", backgroundColor: isPreFilled(key) ? "#f0fdf4" : "white", color: "#1a1a1a" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(2)} disabled={!address.name || !address.phone || !address.addr}
                style={{ padding: "12px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", marginTop: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", opacity: (!address.name || !address.phone || !address.addr) ? 0.5 : 1 }}>
                Continue to Payment <ArrowForwardIcon style={{ fontSize: "16px" }} />
              </button>
            </div>
          )}

          {/* STEP 2: PAYMENT */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "700", color: "#1a1a1a" }}>
                <PaymentIcon style={{ fontSize: "17px", color: "#16a34a", verticalAlign: "middle", marginRight: "4px" }} />
                Payment Method
              </h3>
              <div style={{ backgroundColor: "#f9fafb", borderRadius: "10px", padding: "10px 14px", border: "1px solid #e5e7eb" }}>
                <p style={{ margin: "0 0 2px", fontSize: "10px", fontWeight: "700", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>Delivering to</p>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#1a1a1a" }}>
                  <PersonIcon style={{ fontSize: "13px", verticalAlign: "middle", marginRight: "4px", color: "#16a34a" }} />
                  {address.name} ·
                  <PhoneIcon style={{ fontSize: "13px", verticalAlign: "middle", margin: "0 4px", color: "#16a34a" }} />
                  {address.phone}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#666" }}>
                  <HomeIcon style={{ fontSize: "12px", verticalAlign: "middle", marginRight: "4px", color: "#aaa" }} />
                  {address.addr}{address.city ? `, ${address.city}` : ""}{address.pincode ? ` - ${address.pincode}` : ""}
                </p>
              </div>
              {PAYMENT_METHODS.map((m) => (
                <div key={m.id} onClick={() => setPayMethod(m.id)} style={{ padding: "11px 14px", borderRadius: "12px", cursor: "pointer", border: payMethod === m.id ? `2px solid ${m.color}` : "2px solid #e5e7eb", backgroundColor: payMethod === m.id ? `${m.color}10` : "white", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.2s" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: `${m.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <m.Icon style={{ fontSize: "16px", color: m.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: "600", fontSize: "13px", color: "#1a1a1a" }}>{m.label}</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>{m.desc}</p>
                  </div>
                  {payMethod === m.id ? <CheckCircleIcon style={{ color: m.color, fontSize: "20px" }} /> : <RadioButtonUncheckedIcon style={{ color: "#ddd", fontSize: "20px" }} />}
                </div>
              ))}
              {payMethod === "upi" && (
                <div style={{ position: "relative" }}>
                  <FaMobileAlt style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6366f1", fontSize: "14px" }} />
                  <input placeholder="name@upi / 9876543210@paytm" value={upiId} onChange={(e) => setUpiId(e.target.value)} style={{ padding: "10px 10px 10px 34px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "13px", outline: "none", width: "100%", boxSizing: "border-box" }} />
                </div>
              )}
              {payMethod === "card" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ position: "relative" }}>
                    <FaCreditCard style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#0ea5e9", fontSize: "14px" }} />
                    <input placeholder="Card Number (16 digits)" value={cardNo} onChange={(e) => setCardNo(e.target.value.replace(/\D/g, "").slice(0, 16))} style={{ padding: "10px 10px 10px 34px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "13px", outline: "none", width: "100%", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} style={{ flex: 1, padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "13px", outline: "none" }} />
                    <input placeholder="CVV" value={cvv} onChange={(e) => setCvv(e.target.value.slice(0, 3))} style={{ flex: 1, padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "13px", outline: "none" }} />
                  </div>
                </div>
              )}
              <div style={{ backgroundColor: "#f0fdf4", padding: "12px 16px", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #bbf7d0" }}>
                <span style={{ fontSize: "13px", color: "#555", fontWeight: "600" }}>Total to Pay</span>
                <span style={{ fontSize: "20px", fontWeight: "800", color: "#16a34a" }}>${total.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: "11px", backgroundColor: "white", color: "#555", border: "1px solid #e5e7eb", borderRadius: "12px", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                  <ArrowBackIcon style={{ fontSize: "15px" }} /> Back
                </button>
                <button onClick={handlePayment} disabled={processing} style={{ flex: 2, padding: "11px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <LockIcon style={{ fontSize: "15px" }} />
                  {processing ? "Processing..." : `Pay $${total.toFixed(2)}`}
                </button>
              </div>
              <p style={{ fontSize: "10px", color: "#aaa", textAlign: "center", margin: 0 }}>
                <LockIcon style={{ fontSize: "11px", verticalAlign: "middle" }} /> 256-bit SSL encrypted · Payments processed securely
              </p>
            </div>
          )}

          {/* STEP 3: ORDER TRACKING */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircleIcon style={{ fontSize: "40px", color: "#16a34a" }} />
              </div>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#16a34a" }}>Order Placed!</h3>
              <p style={{ margin: 0, fontSize: "13px", color: "#888", textAlign: "center" }}>
                Order <b style={{ color: "#1a1a1a" }}>#{orderNo}</b> confirmed! Rider will be assigned shortly.
              </p>

              {/* DELIVERY SUMMARY */}
              <div style={{ width: "100%", backgroundColor: "#f9fafb", borderRadius: "12px", padding: "12px 16px", border: "1px solid #e5e7eb" }}>
                <p style={{ margin: "0 0 4px", fontSize: "10px", fontWeight: "700", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>Delivery Details</p>
                <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: "700", color: "#1a1a1a" }}>{address.name} · {address.phone}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>{address.addr}{address.city ? `, ${address.city}` : ""}{address.pincode ? ` - ${address.pincode}` : ""}</p>
              </div>

              {/* LIVE TRACKING TIMELINE */}
              <div style={{ width: "100%" }}>
                {TRACKING.map((s, i) => {
                  const done   = trackingStep >= s.step;
                  const active = trackingStep === s.step - 1 && trackingStep > 0;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", transition: "all 0.5s" }}>
                      <div style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: done ? "#dcfce7" : active ? "#fff7ed" : "#f5f5f5", border: active ? "2px solid #f59e0b" : "2px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.5s" }}>
                        <s.Icon style={{ fontSize: "17px", color: done ? s.color : active ? "#f59e0b" : "#ccc", transition: "all 0.5s" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: done ? "700" : "400", color: done ? "#1a1a1a" : active ? "#f59e0b" : "#aaa", transition: "all 0.5s" }}>
                          {s.label}
                          {active && <span style={{ fontSize: "10px", marginLeft: "6px", color: "#f59e0b" }}>● updating...</span>}
                        </p>
                        <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>{s.time}</p>
                      </div>
                      {done && <CheckCircleIcon style={{ color: "#16a34a", fontSize: "18px", transition: "all 0.5s" }} />}
                    </div>
                  );
                })}
              </div>

              {/* LIVE MAP */}
              <div style={{ width: "100%", borderRadius: "14px", overflow: "hidden", border: "1px solid #bbf7d0", position: "relative" }}>
                <iframe width="100%" height="180" style={{ border: 0, display: "block" }} loading="lazy" allowFullScreen
                  src={`https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed&hl=en`} title="Delivery Location" />
                <div style={{ position: "absolute", bottom: "10px", left: "10px", right: "10px", backgroundColor: "white", borderRadius: "12px", padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.18)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <LocalShippingIcon style={{ color: "white", fontSize: "20px" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: "#1a1a1a" }}>
                      {riderName}
                      {riderInfo && <span style={{ fontSize: "11px", color: "#888", marginLeft: "6px" }}>· {riderPhone}</span>}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <div style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#16a34a" }} />
                      <p style={{ margin: 0, fontSize: "11px", color: "#16a34a", fontWeight: "600" }}>
                        {trackingStep >= 4 ? "Delivered " : trackingStep >= 3 ? "On the way · ETA 20 mins" : trackingStep >= 2 ? "Preparing your order..." : "Finding a rider..."}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: "#1a1a1a" }}>{trackingStep >= 3 ? "0.8 km" : "2.4 km"}</p>
                    <p style={{ margin: 0, fontSize: "10px", color: "#aaa" }}>away</p>
                  </div>
                  {riderPhone && (
                    <a href={`tel:${riderPhone}`} style={{ textDecoration: "none" }}>
                      <div style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <PhoneIcon style={{ fontSize: "16px", color: "#16a34a" }} />
                      </div>
                    </a>
                  )}
                </div>
              </div>

              <button onClick={onSuccess} style={{ width: "100%", padding: "13px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}