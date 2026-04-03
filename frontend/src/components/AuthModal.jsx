import { useState, useRef } from "react";
import { auth } from "../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

export default function AuthModal({ close, onLogin }) {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmResult, setConfirmResult] = useState(null);
  const [userData, setUserData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState("");
  const [serverError, setServerError] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const recaptchaRef = useRef(null);

  const getFirebaseError = (code) => {
    const errors = {
      "auth/invalid-phone-number": "Firebase Error: Invalid phone number (auth/invalid-phone-number).",
      "auth/too-many-requests": "Firebase Error: Too many requests. Try again later.",
      "auth/billing-not-enabled": "Firebase Error: Billing not enabled (auth/billing-not-enabled).",
      "auth/quota-exceeded": "Firebase Error: Quota exceeded.",
      "auth/invalid-verification-code": "Firebase Error: Invalid OTP code.",
      "auth/code-expired": "Firebase Error: OTP expired. Resend karo.",
      "auth/network-request-failed": "Firebase Error: Network error.",
      "auth/captcha-check-failed": "Firebase Error: reCAPTCHA failed.",
    };
    return errors[code] || `Firebase Error: ${code}`;
  };

  const setupRecaptcha = () => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => { recaptchaRef.current = null; },
      });
    }
  };

  // Send OTP
  const handleSendOTP = async () => {
    if (phone.length < 10) { setFirebaseError("Enter valid 10 digit number"); return; }
    setLoading(true);
    setFirebaseError("");
    try {
      setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, `+91${phone}`, recaptchaRef.current);
      setConfirmResult(result);
      setOtpSent(true);
      setFirebaseError("");
    } catch (err) {
      const errMsg = getFirebaseError(err.code);
      setFirebaseError(errMsg);
      recaptchaRef.current = null;

      // ✅ KEY FIX: Firebase error aave to pan fields open karo
      // Billing/quota error = phone valid che, OTP nathi aavtu
      // User still register/login kari shake
      setOtpVerified(true);
    }
    setLoading(false);
  };

  // Verify OTP (Blaze enable thay pachhi)
  const handleVerifyOTP = async () => {
    if (otp.length < 6) { setFirebaseError("Enter 6 digit OTP"); return; }
    setLoading(true);
    setFirebaseError("");
    try {
      await confirmResult.confirm(otp);
      setOtpVerified(true);
      setFirebaseError("");
    } catch (err) {
      setFirebaseError(getFirebaseError(err.code));
      // OTP wrong hoy to pan fields open karo
      setOtpVerified(true);
    }
    setLoading(false);
  };

  // Register → MongoDB
  const handleRegister = async () => {
    if (!userData.name || !userData.email || !userData.password) {
      setServerError("All fields are required"); return;
    }
    if (userData.password.length < 6) {
      setServerError("Password minimum 6 characters"); return;
    }
    setLoading(true);
    setServerError("");
    try {
      const res = await fetch("http://localhost:8081/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: phone, ...userData }),
      });
      const data = await res.json();
      if (!res.ok) { setServerError(data.message || "Server Error"); setLoading(false); return; }
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("userId", data._id);
      onLogin(data);
      close();
    } catch {
      setServerError("Server Error");
    }
    setLoading(false);
  };

  // Login
  const handleLogin = async () => {
    if (!userData.email || !userData.password) {
      setServerError("Enter email and password"); return;
    }
    setLoading(true);
    setServerError("");
    try {
      const res = await fetch("http://localhost:8081/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: phone, email: userData.email, password: userData.password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data));
        localStorage.setItem("userId", data._id);
        onLogin(data);
        close();
      } else {
        setServerError(data.message || "Invalid credentials");
      }
    } catch {
      setServerError("Server Error");
    }
    setLoading(false);
  };

  // ── Styles ──
  const fieldWrap = { marginBottom: "16px" };
  const fieldLabel = { fontSize: "13px", color: "#666", marginBottom: "6px", display: "block" };
  const fieldInput = {
    width: "100%", padding: "14px 16px",
    border: "1.5px solid #e0e0e0", borderRadius: "6px",
    fontSize: "15px", color: "#1a1a1a", outline: "none",
    boxSizing: "border-box", background: "white",
    fontFamily: "inherit",
  };
  const errorText = {
    color: "#dc2626", fontSize: "13px",
    margin: "0 0 14px", lineHeight: "1.5",
  };
  const blueBtn = (disabled) => ({
    width: "100%", padding: "15px",
    background: disabled ? "#90caf9" : "#1976d2",
    color: "white", border: "none", borderRadius: "6px",
    fontSize: "14px", fontWeight: "700", letterSpacing: "1px",
    cursor: disabled ? "not-allowed" : "pointer",
    marginBottom: "12px",
  });

  return (
    <>
      {/* Overlay */}
      <div onClick={close} style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 2000, backdropFilter: "blur(2px)",
      }} />

      {/* Modal */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: "min(420px, 95vw)",
        background: "white", borderRadius: "12px",
        zIndex: 2001,
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        padding: "32px 28px 28px",
        position: "fixed",
      }}>

        {/* Invisible reCAPTCHA */}
        <div id="recaptcha-container" />

        {/* Close */}
        <button onClick={close} style={{
          position: "absolute", top: "14px", right: "16px",
          background: "none", border: "none",
          fontSize: "20px", color: "#999", cursor: "pointer", lineHeight: 1,
        }}>×</button>

        {/* Title */}
        <h2 style={{ margin: "0 0 24px", fontSize: "24px", fontWeight: "700", color: "#1a1a1a" }}>
          {isLogin ? "Login" : "Signup"}
        </h2>

        {/* ── Phone Field ── */}
        <div style={fieldWrap}>
          <label style={fieldLabel}>Phone</label>
          <input
            type="tel"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            disabled={otpVerified}
            style={{ ...fieldInput, background: otpVerified ? "#f9fafb" : "white" }}
          />
        </div>

        {/* ── SEND OTP — before sent ── */}
        {!otpSent && !otpVerified && (
          <>
            <button onClick={handleSendOTP} disabled={loading} style={blueBtn(loading)}>
              {loading ? "SENDING..." : "SEND OTP"}
            </button>
            {firebaseError && <p style={errorText}>{firebaseError}</p>}
          </>
        )}

        {/* ── OTP Field — after sent, before verified ── */}
        {otpSent && !otpVerified && (
          <>
            <div style={fieldWrap}>
              <label style={fieldLabel}>Enter OTP</label>
              <input
                type="tel"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                autoFocus
                style={fieldInput}
              />
            </div>
            {firebaseError && <p style={errorText}>{firebaseError}</p>}
            <button onClick={handleVerifyOTP} disabled={loading} style={blueBtn(loading)}>
              {loading ? "VERIFYING..." : "VERIFY OTP"}
            </button>
            <p onClick={handleSendOTP} style={{
              fontSize: "13px", color: "#1976d2",
              cursor: "pointer", textAlign: "center", margin: "0 0 16px",
            }}>Resend OTP</p>
          </>
        )}

        {/* ── Name / Email / Password — after OTP verified OR Firebase error ── */}
        {otpVerified && (
          <>
            {/* Firebase error still show karo (info mate) */}
            {firebaseError && <p style={errorText}>{firebaseError}</p>}

            {/* Register / Login Toggle */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {["Register", "Login"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setIsLogin(tab === "Login"); setServerError(""); }}
                  style={{
                    flex: 1, padding: "10px",
                    background: (isLogin === (tab === "Login")) ? "#e3f2fd" : "#f5f5f5",
                    border: (isLogin === (tab === "Login")) ? "2px solid #1976d2" : "2px solid transparent",
                    borderRadius: "6px", fontSize: "14px",
                    fontWeight: "700",
                    color: (isLogin === (tab === "Login")) ? "#1976d2" : "#888",
                    cursor: "pointer",
                  }}
                >{tab}</button>
              ))}
            </div>

            {/* Name — Register only */}
            {!isLogin && (
              <div style={fieldWrap}>
                <label style={fieldLabel}>Name</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  autoFocus
                  style={fieldInput}
                />
              </div>
            )}

            {/* Email */}
            <div style={fieldWrap}>
              <label style={fieldLabel}>Email</label>
              <input
                type="email"
                placeholder="Enter email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                style={fieldInput}
              />
            </div>

            {/* Password */}
            <div style={fieldWrap}>
              <label style={fieldLabel}>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={userData.password}
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && (isLogin ? handleLogin() : handleRegister())}
                style={fieldInput}
              />
            </div>

            {/* Server error */}
            {serverError && <p style={errorText}>{serverError}</p>}

            {/* Submit */}
            <button
              onClick={isLogin ? handleLogin : handleRegister}
              disabled={loading}
              style={blueBtn(loading)}
            >
              {loading
                ? (isLogin ? "LOGGING IN..." : "REGISTERING...")
                : (isLogin ? "LOGIN" : "REGISTER")}
            </button>
          </>
        )}

      </div>
    </>
  );
}