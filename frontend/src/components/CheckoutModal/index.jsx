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

const STATUS_TO_STEP = {
  confirmed:  1,
  assigned:   1,
  picked:     2,
  on_the_way: 3,
  delivered:  4,
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
  const [riderInfo,    setRiderInfo]    = useState(null);
  const pollRef = useRef(null);
  const [orderNo] = useState(() => "FRE" + Math.floor(Math.random() * 900000 + 100000));

  const startPolling = (orderId) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`${API}/orders/status/${orderId}`);
        const data = await res.json();
        if (data.order) {
          const newStep = STATUS_TO_STEP[data.order.status] || 1;
          setTrackingStep(newStep);
          if (data.order.riderName) {
            setRiderInfo({ name: data.order.riderName, phone: data.order.riderPhone });
          }
          if (data.order.status === "delivered") {
            clearInterval(pollRef.current);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 5000);
  };

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const handlePayment = () => {
    setProcessing(true);
    setTimeout(async () => {
      setProcessing(false);
      setStep(3);
      setTrackingStep(1);
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
          startPolling(data._id);
          await fetch(`${API}/riders/auto-assign/${data._id}`, { method: "POST" });
        }
        if (clearCart) clearCart();
      } catch (err) {
        console.error("Order save failed:", err);
      }
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

  const isPreFilled = (key) => address[key] && ["name", "phone", "email"].includes(key);

  const mapQuery = encodeURIComponent(
    [address.addr, address.city, address.pincode, "Gujarat", "India"].filter(Boolean).join(", ")
  );

  const TRACKING = [
    { Icon: CheckCircleIcon,   label: "Order Confirmed",  time: "Just now",  step: 1, color: "#16a34a" },
    { Icon: CheckCircleIcon,   label: "Being Prepared",   time: "~5 mins",   step: 2, color: "#16a34a" },
    { Icon: LocalShippingIcon, label: "Out for Delivery", time: "~20 mins",  step: 3, color: "#f59e0b" },
    { Icon: HomeIcon,          label: "Delivered",        time: "~35 mins",  step: 4, color: "#16a34a" },
  ];

  const riderName  = riderInfo?.name  || "Ravi Kumar";
  const riderPhone = riderInfo?.phone || "";

  return (
    <>
      {/* OVERLAY */}
      <div onClick={onClose} className="checkout-overlay" />

      {/* MODAL */}
      <div className="checkout-modal">

        {/* STEP HEADER */}
        <div className="checkout-header">
          <div className="checkout-steps">
            {STEPS.map((s, i) => {
              const num    = i + 1;
              const done   = step > num;
              const active = step === num;
              return (
                <div key={num} className="checkout-step-item">
                  <div className="checkout-step-label-wrap">
                    <div className={`checkout-step-circle ${done ? "step-done" : active ? "step-active" : "step-inactive"}`}>
                      {done ? <CheckCircleIcon style={{ fontSize: "16px" }} /> : num}
                    </div>
                    <span className={`checkout-step-label ${done ? "step-label-done" : active ? "step-label-active" : "step-label-inactive"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div className={`checkout-step-connector ${step > num ? "connector-done" : ""}`} />
                  )}
                </div>
              );
            })}
          </div>
          <button onClick={onClose} className="checkout-close-btn">
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="checkout-body">

          {/* ── STEP 1: ADDRESS ── */}
          {step === 1 && (
            <div className="checkout-section">
              <h3 className="checkout-section-title">
                <LocationOnIcon style={{ fontSize: "17px", color: "#16a34a", verticalAlign: "middle", marginRight: "4px" }} />
                Delivery Address
              </h3>

              {user && (
                <div className="checkout-user-card">
                  <div className="checkout-user-avatar">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="checkout-user-name">{user.name}</p>
                    <p className="checkout-user-meta">{user.email} · {user.mobile || user.phone}</p>
                  </div>
                </div>
              )}

              <div className="checkout-fields-grid">
                {fields.map(({ key, label, placeholder, Icon }) => (
                  <div key={key} className={key === "addr" ? "field-full" : ""}>
                    <label className="checkout-field-label">{label}</label>
                    <div className="checkout-field-wrap">
                      <Icon className={`checkout-field-icon ${isPreFilled(key) ? "icon-prefilled" : ""}`} style={{ fontSize: "14px" }} />
                      <input
                        placeholder={placeholder}
                        value={address[key]}
                        onChange={(e) => setAddress({ ...address, [key]: e.target.value })}
                        className={`checkout-input ${isPreFilled(key) ? "input-prefilled" : ""}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!address.name || !address.phone || !address.addr}
                className="checkout-btn-primary"
                style={{ opacity: (!address.name || !address.phone || !address.addr) ? 0.5 : 1 }}
              >
                Continue to Payment <ArrowForwardIcon style={{ fontSize: "16px" }} />
              </button>
            </div>
          )}

          {/* ── STEP 2: PAYMENT ── */}
          {step === 2 && (
            <div className="checkout-section">
              <h3 className="checkout-section-title">
                <PaymentIcon style={{ fontSize: "17px", color: "#16a34a", verticalAlign: "middle", marginRight: "4px" }} />
                Payment Method
              </h3>

              <div className="checkout-delivery-summary">
                <p className="checkout-summary-eyebrow">Delivering to</p>
                <p className="checkout-summary-name">
                  <PersonIcon style={{ fontSize: "13px", verticalAlign: "middle", marginRight: "4px", color: "#16a34a" }} />
                  {address.name} ·
                  <PhoneIcon style={{ fontSize: "13px", verticalAlign: "middle", margin: "0 4px", color: "#16a34a" }} />
                  {address.phone}
                </p>
                <p className="checkout-summary-addr">
                  <HomeIcon style={{ fontSize: "12px", verticalAlign: "middle", marginRight: "4px", color: "#aaa" }} />
                  {address.addr}{address.city ? `, ${address.city}` : ""}{address.pincode ? ` - ${address.pincode}` : ""}
                </p>
              </div>

              {PAYMENT_METHODS.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setPayMethod(m.id)}
                  className="checkout-payment-option"
                  style={{
                    border: payMethod === m.id ? `2px solid ${m.color}` : "2px solid #e5e7eb",
                    backgroundColor: payMethod === m.id ? `${m.color}10` : "white",
                  }}
                >
                  <div className="checkout-payment-icon-wrap" style={{ backgroundColor: `${m.color}15` }}>
                    <m.Icon style={{ fontSize: "16px", color: m.color }} />
                  </div>
                  <div className="checkout-payment-info">
                    <p className="checkout-payment-label">{m.label}</p>
                    <p className="checkout-payment-desc">{m.desc}</p>
                  </div>
                  {payMethod === m.id
                    ? <CheckCircleIcon style={{ color: m.color, fontSize: "20px" }} />
                    : <RadioButtonUncheckedIcon style={{ color: "#ddd", fontSize: "20px" }} />
                  }
                </div>
              ))}

              {payMethod === "upi" && (
                <div className="checkout-field-wrap">
                  <FaMobileAlt className="checkout-field-icon" style={{ color: "#6366f1", fontSize: "14px" }} />
                  <input
                    placeholder="name@upi / 9876543210@paytm"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="checkout-input"
                  />
                </div>
              )}

              {payMethod === "card" && (
                <div className="checkout-card-fields">
                  <div className="checkout-field-wrap">
                    <FaCreditCard className="checkout-field-icon" style={{ color: "#0ea5e9", fontSize: "14px" }} />
                    <input
                      placeholder="Card Number (16 digits)"
                      value={cardNo}
                      onChange={(e) => setCardNo(e.target.value.replace(/\D/g, "").slice(0, 16))}
                      className="checkout-input"
                    />
                  </div>
                  <div className="checkout-card-row">
                    <input
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="checkout-input checkout-input-half"
                    />
                    <input
                      placeholder="CVV"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.slice(0, 3))}
                      className="checkout-input checkout-input-half"
                    />
                  </div>
                </div>
              )}

              <div className="checkout-total-bar">
                <span className="checkout-total-label">Total to Pay</span>
                <span className="checkout-total-amount">${total.toFixed(2)}</span>
              </div>

              <div className="checkout-action-row">
                <button onClick={() => setStep(1)} className="checkout-btn-back">
                  <ArrowBackIcon style={{ fontSize: "15px" }} /> Back
                </button>
                <button onClick={handlePayment} disabled={processing} className="checkout-btn-pay">
                  <LockIcon style={{ fontSize: "15px" }} />
                  {processing ? "Processing..." : `Pay $${total.toFixed(2)}`}
                </button>
              </div>

              <p className="checkout-ssl-note">
                <LockIcon style={{ fontSize: "11px", verticalAlign: "middle" }} /> 256-bit SSL encrypted · Payments processed securely
              </p>
            </div>
          )}

          {/* ── STEP 3: ORDER TRACKING ── */}
          {step === 3 && (
            <div className="checkout-tracking-wrap">
              <div className="checkout-success-icon">
                <CheckCircleIcon style={{ fontSize: "40px", color: "#16a34a" }} />
              </div>
              <h3 className="checkout-success-title">Order Placed!</h3>
              <p className="checkout-success-sub">
                Order <b style={{ color: "#1a1a1a" }}>#{orderNo}</b> confirmed! Rider will be assigned shortly.
              </p>

              {/* DELIVERY SUMMARY */}
              <div className="checkout-delivery-card">
                <p className="checkout-summary-eyebrow">Delivery Details</p>
                <p className="checkout-delivery-name">{address.name} · {address.phone}</p>
                <p className="checkout-delivery-addr">
                  {address.addr}{address.city ? `, ${address.city}` : ""}{address.pincode ? ` - ${address.pincode}` : ""}
                </p>
              </div>

              {/* TRACKING TIMELINE */}
              <div className="checkout-tracking-timeline">
                {TRACKING.map((s, i) => {
                  const done   = trackingStep >= s.step;
                  const active = trackingStep === s.step - 1 && trackingStep > 0;
                  return (
                    <div key={i} className="checkout-tracking-row">
                      <div
                        className="checkout-tracking-icon-wrap"
                        style={{
                          backgroundColor: done ? "#dcfce7" : active ? "#fff7ed" : "#f5f5f5",
                          border: active ? "2px solid #f59e0b" : "2px solid transparent",
                        }}
                      >
                        <s.Icon style={{ fontSize: "17px", color: done ? s.color : active ? "#f59e0b" : "#ccc", transition: "all 0.5s" }} />
                      </div>
                      <div className="checkout-tracking-info">
                        <p className={`checkout-tracking-label ${done ? "tracking-done" : active ? "tracking-active" : "tracking-pending"}`}>
                          {s.label}
                          {active && <span className="tracking-updating">● updating...</span>}
                        </p>
                        <p className="checkout-tracking-time">{s.time}</p>
                      </div>
                      {done && <CheckCircleIcon style={{ color: "#16a34a", fontSize: "18px", transition: "all 0.5s" }} />}
                    </div>
                  );
                })}
              </div>

              {/* LIVE MAP */}
              <div className="checkout-map-wrap">
                <iframe
                  width="100%"
                  height="180"
                  className="checkout-map-iframe"
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed&hl=en`}
                  title="Delivery Location"
                />
                <div className="checkout-rider-card">
                  <div className="checkout-rider-avatar">
                    <LocalShippingIcon style={{ color: "white", fontSize: "20px" }} />
                  </div>
                  <div className="checkout-rider-info">
                    <p className="checkout-rider-name">
                      {riderName}
                      {riderInfo && <span className="checkout-rider-phone-inline">· {riderPhone}</span>}
                    </p>
                    <div className="checkout-rider-status">
                      <div className="checkout-rider-dot" />
                      <p className="checkout-rider-eta">
                        {trackingStep >= 4
                          ? "Delivered"
                          : trackingStep >= 3
                          ? "On the way · ETA 20 mins"
                          : trackingStep >= 2
                          ? "Preparing your order..."
                          : "Finding a rider..."}
                      </p>
                    </div>
                  </div>
                  <div className="checkout-rider-distance">
                    <p className="checkout-rider-km">{trackingStep >= 3 ? "0.8 km" : "2.4 km"}</p>
                    <p className="checkout-rider-away">away</p>
                  </div>
                  {riderPhone && (
                    <a href={`tel:${riderPhone}`} className="checkout-rider-call">
                      <div className="checkout-rider-call-btn">
                        <PhoneIcon style={{ fontSize: "16px", color: "#16a34a" }} />
                      </div>
                    </a>
                  )}
                </div>
              </div>

              <button onClick={onSuccess} className="checkout-btn-continue">
                Continue Shopping
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}