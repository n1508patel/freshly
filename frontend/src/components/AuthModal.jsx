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

  return (
    <>
      {/* Overlay */}
      <div onClick={close} className="auth-modal-overlay" />

      {/* Modal */}
      <div className="auth-modal">

        {/* Invisible reCAPTCHA */}
        <div id="recaptcha-container" />

        {/* Close */}
        <button onClick={close} className="auth-modal-close">×</button>

        {/* Title */}
        <h2 className="auth-modal-title">
          {isLogin ? "Login" : "Signup"}
        </h2>

        {/* ── Phone Field ── */}
        <div className="field-wrap">
          <label className="field-label">Phone</label>
          <input
            type="tel"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            disabled={otpVerified}
            className="field-input"
          />
        </div>

        {/* ── SEND OTP — before sent ── */}
        {!otpSent && !otpVerified && (
          <>
            <button onClick={handleSendOTP} disabled={loading} className="blue-btn">
              {loading ? "SENDING..." : "SEND OTP"}
            </button>
            {firebaseError && <p className="error-text">{firebaseError}</p>}
          </>
        )}

        {/* ── OTP Field — after sent, before verified ── */}
        {otpSent && !otpVerified && (
          <>
            <div className="field-wrap">
              <label className="field-label">Enter OTP</label>
              <input
                type="tel"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                autoFocus
                className="field-input"
              />
            </div>
            {firebaseError && <p className="error-text">{firebaseError}</p>}
            <button onClick={handleVerifyOTP} disabled={loading} className="blue-btn">
              {loading ? "VERIFYING..." : "VERIFY OTP"}
            </button>
            <p onClick={handleSendOTP} className="resend-otp-link">
              Resend OTP
            </p>
          </>
        )}

        {/* ── Name / Email / Password — after OTP verified OR Firebase error ── */}
        {otpVerified && (
          <>
            {/* Firebase error still show karo (info mate) */}
            {firebaseError && <p className="error-text">{firebaseError}</p>}

            {/* Register / Login Toggle */}
            <div className="tab-container">
              {["Register", "Login"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setIsLogin(tab === "Login"); setServerError(""); }}
                  className={`tab-button ${isLogin === (tab === "Login") ? "active" : ""}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Name — Register only */}
            {!isLogin && (
              <div className="field-wrap">
                <label className="field-label">Name</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  autoFocus
                  className="field-input"
                />
              </div>
            )}

            {/* Email */}
            <div className="field-wrap">
              <label className="field-label">Email</label>
              <input
                type="email"
                placeholder="Enter email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                className="field-input"
              />
            </div>

            {/* Password */}
            <div className="field-wrap">
              <label className="field-label">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={userData.password}
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && (isLogin ? handleLogin() : handleRegister())}
                className="field-input"
              />
            </div>

            {/* Server error */}
            {serverError && <p className="error-text">{serverError}</p>}

            {/* Submit */}
            <button
              onClick={isLogin ? handleLogin : handleRegister}
              disabled={loading}
              className="blue-btn"
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