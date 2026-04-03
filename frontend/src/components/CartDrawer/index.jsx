import { useState } from "react";
import { useCart } from "../../context/CartContext";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckoutModal from "../CheckoutModal";
import AuthModal from "../AuthModal";

const DELIVERY = 40;
const TAX_RATE = 0.05;

const COUPONS = {
  FRESH10: 10,
  SAVE20: 20,
  FRESHLY50: 50,
};

export default function CartDrawer({ open, onClose }) {
  const { cart, removeFromCart, updateQty, clearCart, subtotal, totalItems } = useCart();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const tax = subtotal * TAX_RATE;
  const deliveryCharge = subtotal > 500 ? 0 : DELIVERY;
  const total = subtotal + tax + deliveryCharge - discount;

  // Get logged in user from localStorage
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (COUPONS[code]) {
      setDiscount(COUPONS[code]);
      setCouponMsg(`Coupon applied! $${COUPONS[code]} off`);
    } else {
      setDiscount(0);
      setCouponMsg("Invalid coupon code");
    }
  };

  const handleCheckout = () => {
    if (!user) {
      // Show login popup first
      setShowAuth(true);
    } else {
      setShowCheckout(true);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* OVERLAY */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1000 }} />

      {/* DRAWER */}
      <div style={{
        position: "fixed", top: 0, right: 0,
        width: "420px", height: "100vh",
        backgroundColor: "white", zIndex: 1001,
        display: "flex", flexDirection: "column",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
      }}>

        {/* HEADER */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>Cart ({totalItems} items)</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <CloseIcon />
          </button>
        </div>

        {/* USER INFO STRIP — show if logged in */}
        {user && (
          <div style={{
            padding: "10px 20px", backgroundColor: "#f0fdf4",
            borderBottom: "1px solid #bbf7d0",
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              backgroundColor: "#16a34a", color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "14px", fontWeight: "700", flexShrink: 0,
            }}>
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#15803d" }}>
                 Hey, {user.name || "there"}!
              </p>
              <p style={{ margin: 0, fontSize: "11px", color: "#16a34a" }}>{user.email || user.mobile}</p>
            </div>
          </div>
        )}

        {/* NOT LOGGED IN STRIP */}
        {!user && cart.length > 0 && (
          <div style={{
            padding: "10px 20px", backgroundColor: "#fff7ed",
            borderBottom: "1px solid #fed7aa",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <p style={{ margin: 0, fontSize: "12px", color: "#ea580c" }}>
              Login to checkout & save your orders
            </p>
            <button
              onClick={() => setShowAuth(true)}
              style={{
                padding: "4px 12px", backgroundColor: "#ea580c", color: "white",
                border: "none", borderRadius: "6px", fontSize: "12px",
                fontWeight: "600", cursor: "pointer",
              }}
            >
              Login
            </button>
          </div>
        )}

        {/* CART ITEMS */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}></div>
              <p style={{ fontSize: "16px" }}>Your cart is empty</p>
              <p style={{ fontSize: "13px", color: "#aaa" }}>Add items to get started!</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item._id} style={{
                display: "flex", gap: "12px", alignItems: "center",
                padding: "12px 0", borderBottom: "1px solid #f5f5f5",
              }}>
                <img
                  src={item.imgs?.[0] || item.image}
                  alt={item.name}
                  style={{ width: "64px", height: "64px", objectFit: "contain", borderRadius: "8px", backgroundColor: "#f9fafb" }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: "600", color: "#1a1a1a" }}>{item.name}</p>
                  {item.brand && <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#aaa" }}>{item.brand}</p>}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#16a34a" }}>${Number(item.price).toFixed(2)}</p>
                    {item.old && <p style={{ margin: 0, fontSize: "11px", color: "#aaa", textDecoration: "line-through" }}>${item.old}</p>}
                  </div>
                  <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#888" }}>
                    Subtotal: ${(Number(item.price) * item.qty).toFixed(2)}
                  </p>
                </div>

                {/* QTY CONTROLS */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <button onClick={() => updateQty(item._id, item.qty - 1)} style={{ width: "28px", height: "28px", border: "1px solid #e5e7eb", borderRadius: "6px 0 0 6px", background: "#f9fafb", fontSize: "16px", cursor: "pointer", fontWeight: "700" }}>−</button>
                    <span style={{ width: "32px", height: "28px", border: "1px solid #e5e7eb", borderLeft: "none", borderRight: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "600" }}>{item.qty}</span>
                    <button onClick={() => updateQty(item._id, item.qty + 1)} style={{ width: "28px", height: "28px", border: "1px solid #e5e7eb", borderRadius: "0 6px 6px 0", background: "#f9fafb", fontSize: "16px", cursor: "pointer", fontWeight: "700" }}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item._id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "11px", display: "flex", alignItems: "center", gap: "2px" }}>
                    <DeleteOutlineIcon style={{ fontSize: "14px" }} /> Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* BOTTOM SECTION */}
        {cart.length > 0 && (
          <div style={{ borderTop: "1px solid #f0f0f0", padding: "16px 20px" }}>

            {/* COUPON */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Coupon code (FRESH10, SAVE20...)"
                style={{ flex: 1, padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px", outline: "none" }}
              />
              <button onClick={applyCoupon} style={{ padding: "8px 14px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                Apply
              </button>
            </div>
            {couponMsg && <p style={{ fontSize: "12px", color: discount > 0 ? "#16a34a" : "#ef4444", margin: "0 0 10px" }}>{couponMsg}</p>}

            {/* BILL SUMMARY */}
            <div style={{ backgroundColor: "#f9fafb", borderRadius: "10px", padding: "12px", marginBottom: "12px" }}>
              <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: "700", color: "#1a1a1a" }}>Bill Summary</p>
              {[
                { label: `Items (${totalItems})`, value: `${subtotal.toFixed(2)}` },
                { label: "Tax (5%)", value: `${tax.toFixed(2)}` },
                { label: subtotal > 500 ? "Delivery  FREE" : "Delivery", value: subtotal > 500 ? "$0.00" : `$${DELIVERY}.00` },
                ...(discount > 0 ? [{ label: "Coupon Discount", value: `-$${discount.toFixed(2)}`, green: true }] : []),
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: row.green ? "#16a34a" : "#666", marginBottom: "4px" }}>
                  <span>{row.label}</span><span>{row.value}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: "700", color: "#1a1a1a", borderTop: "1px solid #e5e7eb", paddingTop: "8px", marginTop: "4px" }}>
                <span>Total</span><span>${Math.max(total, 0).toFixed(2)}</span>
              </div>
            </div>

            {subtotal > 0 && subtotal < 500 && (
              <p style={{ fontSize: "11px", color: "#f59e0b", marginBottom: "10px", textAlign: "center" }}>
                 Add ${(500 - subtotal).toFixed(2)} more for FREE delivery!
              </p>
            )}

            {/* CHECKOUT BUTTON */}
            <button
              onClick={handleCheckout}
              style={{ width: "100%", padding: "13px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}
            >
              {user ? "Proceed to Checkout →" : " Login to Checkout"}
            </button>

            <button
              onClick={clearCart}
              style={{ width: "100%", padding: "10px", marginTop: "8px", backgroundColor: "white", color: "#ef4444", border: "1px solid #ef4444", borderRadius: "12px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>

      {/* LOGIN POPUP — shows when not logged in and clicks checkout */}
      {showAuth && (
        <AuthModal
          close={() => setShowAuth(false)}
          onLogin={(u) => {
            localStorage.setItem("user", JSON.stringify(u));
            setShowAuth(false);
            // After login, open checkout automatically
            setTimeout(() => setShowCheckout(true), 300);
          }}
        />
      )}

      {/* CHECKOUT MODAL */}
      {showCheckout && (
        <CheckoutModal
          total={Math.max(total, 0)}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            clearCart();
            setShowCheckout(false);
            onClose();
          }}
        />
      )}
    </>
  );
}