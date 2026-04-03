import { Link, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { CartContext } from "../../context/CartContext";
import {
  FaShoppingBag, FaUserCircle, FaChevronDown,
  FaBars, FaHome, FaBreadSlice,
  FaFish, FaGift, FaPenAlt, FaPhoneAlt, FaSearch,
  FaMapMarkerAlt,
} from "react-icons/fa";
import AreaDropdown from '../AreaDropdown';
import CartDrawer from '../CartDrawer';
import AuthModal from '../AuthModal';

const GREEN = "#16a34a";

const Header = () => {
  const { cartItems } = useContext(CartContext);
  const [showCatMenu, setShowCatMenu]   = useState(false);
  const [cartOpen,    setCartOpen]      = useState(false);
  const [showAuth,    setShowAuth]      = useState(false);
  const [query,       setQuery]         = useState("");

  const location = useLocation();

  const storedUser = localStorage.getItem("user");
  const localUser  = storedUser ? JSON.parse(storedUser) : null;

  const totalItems = cartItems?.reduce((s, i) => s + (i.qty || 0), 0) || 0;
  const totalPrice = cartItems?.reduce((s, i) => s + i.price * (i.qty || 0), 0) || 0;

  const handleSearch = () => {
    if (!query.trim()) return;
    window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
  };

  const categories = [
    { label: "Fruits & Vegetables",  path: "/category/fruits" },
    { label: "Dairy & Eggs",         path: "/category/dairy" },
    { label: "Bakery",              path: "/category/bakery" },
    { label: "Snacks",             path: "/category/snacks" },
    { label: "Beverages",            path: "/category/beverages" },
    { label: "Sea Food",           path: "/category/seafood" },
    { label: "Meat",              path: "/category/meat" },
  ];

  const navLinks = [
    { label: "Home",       path: "/",        icon: <FaHome size={13} /> },
    { label: "Shop",       path: "/shop",    icon: <FaShoppingBag size={13} />, hasDropdown: true },
    { label: "Bakery",     path: "/bakery",  icon: <FaBreadSlice size={13} /> },
    { label: "SeaFood",    path: "/seafood", icon: <FaFish size={13} /> },
    { label: "Gifts",      path: "/gifts",   icon: <FaGift size={13} /> },
    { label: "Blog",       path: "/blog",    icon: <FaPenAlt size={13} /> },
    { label: "Contact us", path: "/contact", icon: <FaPhoneAlt size={13} /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        /* ── TOP STRIP ── */
        .h-top-strip {
          background: ${GREEN};
          color: white;
          font-size: 13px;
          font-weight: 500;
          padding: 7px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          letter-spacing: 0.01em;
        }
        .h-top-strip-center {
          display: flex;
          align-items: center;
          gap: 28px;
          flex: 1;
          justify-content: center;
        }
        .h-top-strip-item {
          display: flex;
          align-items: center;
          gap: 6px;
          opacity: 0.95;
        }
        .h-top-strip-right {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }
        .h-strip-link {
          color: rgba(255,255,255,0.88);
          text-decoration: none;
          font-size: 12.5px;
          transition: color .15s;
        }
        .h-strip-link:hover { color: white; text-decoration: underline; }
        .h-strip-close {
          background: none; border: none; color: rgba(255,255,255,0.75);
          cursor: pointer; padding: 0; display: flex; align-items: center;
          transition: color .15s;
        }
        .h-strip-close:hover { color: white; }
        .h-strip-divider {
          width: 1px; height: 14px;
          background: rgba(255,255,255,0.3);
        }

        /* ── SEARCH ── */
        .h-search { transition: border-color .18s, box-shadow .18s; }
        .h-search:focus-within {
          border-color: #16a34a !important;
          box-shadow: 0 0 0 3px rgba(22,163,74,0.12);
        }
        .h-search input { background: transparent; }
        .h-search-btn {
          width: 46px; height: 100%; flex-shrink: 0;
          background: transparent; border: none; border-left: 1px solid #e5e7eb;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          color: #6b7280; transition: color .15s, background .15s;
          appearance: none; -webkit-appearance: none;
        }
        .h-search-btn:hover { color: ${GREEN}; background: #f9fafb; }

        /* ── USER ICON ── */
        .h-user {
          width: 40px; height: 40px; border-radius: 50%;
          background: ${GREEN}; display: flex; align-items: center;
          justify-content: center; cursor: pointer;
          transition: opacity .18s, transform .18s;
          flex-shrink: 0;
        }
        .h-user:hover { opacity: .88; transform: scale(1.04); }

        /* ── CART ICON ── */
        .h-cart {
          position: relative; width: 40px; height: 40px; border-radius: 50%;
          background: #f3f4f6; display: flex; align-items: center;
          justify-content: center; cursor: pointer;
          border: 1.5px solid #e5e7eb;
          transition: border-color .18s, box-shadow .18s;
          flex-shrink: 0;
        }
        .h-cart:hover { border-color: #d1d5db; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

        .h-cart-price {
          font-size: 15px; font-weight: 700; color: #111;
          cursor: pointer; white-space: nowrap;
        }

        /* ── NAV LINKS ── */
        .h-nav-link {
          display: flex; align-items: center; gap: 6px;
          padding: 0 16px; height: 100%; color: #555;
          text-decoration: none; font-size: 14px; font-weight: 500;
          white-space: nowrap; border-bottom: 2.5px solid transparent;
          transition: color .15s, border-color .15s;
        }
        .h-nav-link:hover { color: #111; }
        .h-nav-link.active {
          color: #111; font-weight: 600;
          border-bottom-color: ${GREEN};
        }

        /* ── ALL CATEGORIES ── */
        .h-allcat {
          background: ${GREEN}; color: white;
          padding: 0 22px; font-weight: 700; font-size: 13px;
          cursor: pointer; display: flex; align-items: center; gap: 9px;
          position: relative; user-select: none; white-space: nowrap;
          letter-spacing: .04em; border: none; height: 100%;
          transition: background .15s; flex-shrink: 0;
        }
        .h-allcat:hover { background: #15803d; }

        /* ── CATEGORY DROPDOWN ── */
        .h-cat-drop {
          position: absolute; top: 100%; left: 0; width: 240px;
          background: white; border: 1px solid #e5e7eb;
          border-radius: 0 0 12px 12px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.12);
          z-index: 9999; padding: 6px 0;
          animation: dropFade .15s ease;
        }
        @keyframes dropFade {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .h-cat-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 18px; color: #333; text-decoration: none;
          font-size: 13.5px; font-weight: 500;
          transition: background .12s, color .12s;
        }
        .h-cat-item:hover { background: #f0fdf4; color: ${GREEN}; }

        /* chevron rotate */
        .chevron-open  { transform: rotate(180deg); transition: transform .2s; }
        .chevron-close { transform: rotate(0deg);   transition: transform .2s; }

        /* ── HEADER INNER LAYOUT ── */
        .h-inner {
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }
      `}</style>

      <div style={{
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        position: "sticky", top: 0, zIndex: 1000,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      }}>

        {/* ── TOP ANNOUNCEMENT STRIP ── */}
        <div className="h-top-strip">
            {/* Left: empty for balance */}
            <div style={{ width: 80 }} />

            {/* Center: single announcement */}
            <div className="h-top-strip-center">
              <div className="h-top-strip-item">
                 <span>Items such as fruits, vegetables, and dairy are carefully picked and packed, often sourced directly from farmers.</span>
              </div>
            </div>

            {/* Right: spacer for balance */}
            <div style={{ width: 80 }} />
        </div>

        {/* ── MAIN HEADER ROW ── */}
        <div style={{
          background: "white",
          borderBottom: "1px solid #f0f0f0",
        }}>
          <div className="h-inner" style={{
            padding: "0 40px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            height: "72px",
          }}>

            {/* Brand */}
            <Link to="/" style={{ textDecoration: "none", flexShrink: 0 }}>
              <div style={{ fontSize: "27px", fontWeight: "800", color: GREEN, lineHeight: 1.1 }}>
                Freshly
              </div>
              <div style={{ fontSize: "9.5px", color: "#9ca3af", fontWeight: "600", letterSpacing: "0.08em", marginTop: "2px" }}>
                FRESH GROCERY ALWAYS
              </div>
            </Link>

            {/* Divider */}
            <div style={{ width: "1px", height: "38px", background: "#e5e7eb", flexShrink: 0, marginLeft: "4px" }} />

            {/* Location */}
            <div style={{ flexShrink: 0 }}>
              <AreaDropdown />
            </div>

            {/* Divider */}
            <div style={{ width: "1px", height: "38px", background: "#e5e7eb", flexShrink: 0 }} />

            {/* Search Bar */}
            <div
              className="h-search"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "stretch",
                border: "1.5px solid #e5e7eb",
                borderRadius: "10px",
                overflow: "hidden",
                height: "44px",
                maxWidth: "560px",
                background: "white",
              }}
            >
              <input
                type="text"
                placeholder="Search for products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                style={{
                  flex: 1, padding: "0 18px",
                  border: "none", outline: "none",
                  fontSize: "14px", color: "#111",
                  minWidth: 0,
                }}
              />
              <button className="h-search-btn" onClick={handleSearch}>
                <FaSearch size={14} />
              </button>
            </div>

            {/* Spacer pushes user+cart to right */}
            <div style={{ flex: 1, maxWidth: "60px" }} />

            {/* User Icon */}
            <div
              className="h-user"
              onClick={() => localUser ? (window.location.href = "/profile") : setShowAuth(true)}
              title={localUser ? "My Profile" : "Sign In"}
            >
              {localUser ? (
                <span style={{ fontSize: "16px", fontWeight: "800", color: "white" }}>
                  {localUser.name?.[0]?.toUpperCase() || "U"}
                </span>
              ) : (
                <FaUserCircle size={21} color="white" />
              )}
            </div>

            {/* Cart Icon + Price */}
            <div
              style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
              onClick={() => setCartOpen(true)}
            >
              <div className="h-cart">
                <FaShoppingBag size={17} color="#374151" />
                {totalItems > 0 && (
                  <span style={{
                    position: "absolute", top: "-4px", right: "-4px",
                    background: "#dc2626", color: "white", fontSize: "10px",
                    width: "17px", height: "17px", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: "700", lineHeight: 1,
                  }}>{totalItems}</span>
                )}
              </div>
              <span className="h-cart-price">${totalPrice.toFixed(2)}</span>
            </div>

          </div>
        </div>

        {/* ── NAVIGATION BAR ── */}
        <nav style={{
          background: "white",
          borderBottom: "1px solid #efefef",
        }}>
          <div className="h-inner" style={{
            display: "flex",
            alignItems: "stretch",
            padding: "0 40px",
            height: "48px",
          }}>

            {/* ALL CATEGORIES */}
            <button
              className="h-allcat"
              onMouseEnter={() => setShowCatMenu(true)}
              onMouseLeave={() => setShowCatMenu(false)}
            >
              <FaBars size={14} />
              ALL CATEGORIES
              <FaChevronDown size={10} className={showCatMenu ? "chevron-open" : "chevron-close"} />

              {showCatMenu && (
                <div className="h-cat-drop">
                  {categories.map((item, i) => (
                    <Link
                      key={i}
                      to={item.path}
                      className="h-cat-item"
                      style={{
                        borderBottom: i < categories.length - 1 ? "1px solid #f3f4f6" : "none",
                      }}
                    >
                      <span style={{ fontSize: "16px" }}>{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </button>

            {/* Nav Links */}
            <ul style={{
              display: "flex", listStyle: "none",
              margin: 0, padding: 0,
              gap: "2px",
            }}>
              {navLinks.map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "stretch" }}>
                  <Link
                    to={item.path}
                    className={`h-nav-link${isActive(item.path) ? " active" : ""}`}
                  >
                    <span style={{ color: isActive(item.path) ? GREEN : "#9ca3af" }}>
                      {item.icon}
                    </span>
                    {item.label}
                    {item.hasDropdown && (
                      <FaChevronDown size={9} color="#9ca3af" style={{ marginLeft: "2px" }} />
                    )}
                  </Link>
                </li>
              ))}
            </ul>

          </div>
        </nav>

      </div>

      {/* Drawers & Modals */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      {showAuth && (
        <AuthModal
          close={() => setShowAuth(false)}
          onLogin={(u) => {
            localStorage.setItem("user", JSON.stringify(u));
            setShowAuth(false);
            window.location.href = "/profile";
          }}
        />
      )}
    </>
  );
};

export default Header;