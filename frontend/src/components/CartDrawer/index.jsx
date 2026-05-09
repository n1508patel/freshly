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
      {/* Overlay */}
      <div onClick={onClose} className="cart-drawer-overlay" />

      {/* Drawer */}
      <div className="cart-drawer">

        {/* Header */}
        <div className="cart-drawer-header">
          <h2 className="cart-drawer-title">
            Cart ({totalItems} items)
          </h2>
          <button onClick={onClose} className="cart-drawer-close-btn">
            <CloseIcon />
          </button>
        </div>

        {/* User Info Strip — show if logged in */}
        {user && (
          <div className="cart-user-strip">
            <div className="cart-user-avatar">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="cart-user-name">
                 Hey, {user.name || "there"}!
              </p>
              <p className="cart-user-email">
                {user.email || user.mobile}
              </p>
            </div>
          </div>
        )}

        {/* Not Logged In Strip */}
        {!user && cart.length > 0 && (
          <div className="cart-not-logged-strip">
            <p className="cart-not-logged-text">
              Login to checkout & save your orders
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="cart-login-btn"
            >
              Login
            </button>
          </div>
        )}

        {/* Cart Items */}
        <div className="cart-items-container">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <p className="cart-empty-title">Your cart is empty</p>
              <p className="cart-empty-subtitle">Add items to get started!</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item._id} className="cart-item">
                <img
                  src={item.imgs?.[0] || item.image}
                  alt={item.name}
                  className="cart-item-image"
                />
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.name}</p>
                  {item.brand && <p className="cart-item-brand">{item.brand}</p>}
                  <div className="cart-item-price-row">
                    <p className="cart-item-price">
                      ${Number(item.price).toFixed(2)}
                    </p>
                    {item.old && (
                      <p className="cart-item-old-price">
                        ${item.old}
                      </p>
                    )}
                  </div>
                  <p className="cart-item-subtotal">
                    Subtotal: ${(Number(item.price) * item.qty).toFixed(2)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="cart-qty-controls">
                  <div className="cart-qty-buttons">
                    <button
                      onClick={() => updateQty(item._id, item.qty - 1)}
                      className="cart-qty-btn"
                    >
                      −
                    </button>
                    <span className="cart-qty-display">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item._id, item.qty + 1)}
                      className="cart-qty-btn"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="cart-remove-btn"
                  >
                    <DeleteOutlineIcon style={{ fontSize: "14px" }} />
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Section */}
        {cart.length > 0 && (
          <div className="cart-bottom-section">

            {/* Coupon */}
            <div className="cart-coupon-container">
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Coupon code (FRESH10, SAVE20...)"
                className="cart-coupon-input"
              />
              <button onClick={applyCoupon} className="cart-coupon-btn">
                Apply
              </button>
            </div>
            {couponMsg && (
              <p className={`cart-coupon-msg ${discount > 0 ? "success" : "error"}`}>
                {couponMsg}
              </p>
            )}

            {/* Bill Summary */}
            <div className="cart-bill-summary">
              <p className="cart-bill-title">Bill Summary</p>
              {[
                { label: `Items (${totalItems})`, value: `${subtotal.toFixed(2)}` },
                { label: "Tax (5%)", value: `${tax.toFixed(2)}` },
                {
                  label: subtotal > 500 ? "Delivery  FREE" : "Delivery",
                  value: subtotal > 500 ? "$0.00" : `$${DELIVERY}.00`,
                },
                ...(discount > 0
                  ? [{ label: "Coupon Discount", value: `-$${discount.toFixed(2)}`, green: true }]
                  : []),
              ].map((row, i) => (
                <div key={i} className={`cart-bill-row ${row.green ? "green" : ""}`}>
                  <span>{row.label}</span>
                  <span>{row.value}</span>
                </div>
              ))}
              <div className="cart-bill-total">
                <span>Total</span>
                <span>${Math.max(total, 0).toFixed(2)}</span>
              </div>
            </div>

            {subtotal > 0 && subtotal < 500 && (
              <p className="cart-free-delivery-msg">
                 Add ${(500 - subtotal).toFixed(2)} more for FREE delivery!
              </p>
            )}

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="cart-checkout-btn"
            >
              {user ? "Proceed to Checkout →" : " Login to Checkout"}
            </button>

            <button
              onClick={clearCart}
              className="cart-clear-btn"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>

      {/* Login Popup */}
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

      {/* Checkout Modal */}
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