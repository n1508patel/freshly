import { Link, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { CartContext } from "../../context/CartContext";
import {
  FaShoppingBag, FaUserCircle, FaChevronDown,
  FaBars, FaHome, FaBreadSlice,
  FaFish, FaGift, FaPenAlt, FaPhoneAlt, FaSearch,
} from "react-icons/fa";
import AreaDropdown from "../AreaDropdown";
import CartDrawer from "../CartDrawer";
import AuthModal from "../AuthModal";

const Header = () => {
  const { cartItems } = useContext(CartContext);
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [cartOpen,    setCartOpen]    = useState(false);
  const [showAuth,    setShowAuth]    = useState(false);
  const [query,       setQuery]       = useState("");
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
    { label: "Fruits & Vegetables", path: "/category/fruits" },
    { label: "Dairy & Eggs",        path: "/category/dairy" },
    { label: "Bakery",              path: "/category/bakery" },
    { label: "Snacks",              path: "/category/snacks" },
    { label: "Beverages",           path: "/category/beverages" },
    { label: "Sea Food",            path: "/category/seafood" },
    { label: "Meat",                path: "/category/meat" },
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
      <div className="header-root">

        {/* ── TOP ANNOUNCEMENT STRIP ── */}
        <div className="h-top-strip">
          <div className="h-top-strip-spacer" />
          <div className="h-top-strip-center">
            <div className="h-top-strip-item">
              <span>Items such as fruits, vegetables, and dairy are carefully picked and packed, often sourced directly from farmers.</span>
            </div>
          </div>
          <div className="h-top-strip-spacer" />
        </div>

        {/* ── MAIN HEADER ROW ── */}
        <div className="h-main-row">
          <div className="h-inner h-main-inner">

            {/* Brand */}
            <Link to="/" className="h-brand-link">
              <div className="h-brand-name">Freshly</div>
              <div className="h-brand-tagline">FRESH GROCERY ALWAYS</div>
            </Link>

            {/* Divider */}
            <div className="h-divider" />

            {/* Location */}
            <div className="h-location">
              <AreaDropdown />
            </div>

            {/* Divider */}
            <div className="h-divider" />

            {/* Search Bar */}
            <div className="h-search">
              <input
                type="text"
                placeholder="Search for products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-search-input"
              />
              <button className="h-search-btn" onClick={handleSearch}>
                <FaSearch size={14} />
              </button>
            </div>

            {/* Spacer */}
            <div className="h-flex-spacer" />

            {/* User Icon */}
            <div
              className="h-user"
              onClick={() => localUser ? (window.location.href = "/profile") : setShowAuth(true)}
              title={localUser ? "My Profile" : "Sign In"}
            >
              {localUser ? (
                <span className="h-user-initial">
                  {localUser.name?.[0]?.toUpperCase() || "U"}
                </span>
              ) : (
                <FaUserCircle size={21} color="white" />
              )}
            </div>

            {/* Cart Icon + Price */}
            <div className="h-cart-wrap" onClick={() => setCartOpen(true)}>
              <div className="h-cart">
                <FaShoppingBag size={17} color="#374151" />
                {totalItems > 0 && (
                  <span className="h-cart-badge">{totalItems}</span>
                )}
              </div>
              <span className="h-cart-price">${totalPrice.toFixed(2)}</span>
            </div>

          </div>
        </div>

        {/* ── NAVIGATION BAR ── */}
        <nav className="h-nav">
          <div className="h-inner h-nav-inner">

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
                      className={`h-cat-item${i < categories.length - 1 ? " h-cat-item-bordered" : ""}`}
                    >
                      <span className="h-cat-item-icon">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </button>

            {/* Nav Links */}
            <ul className="h-nav-list">
              {navLinks.map((item, i) => (
                <li key={i} className="h-nav-list-item">
                  <Link
                    to={item.path}
                    className={`h-nav-link${isActive(item.path) ? " active" : ""}`}
                  >
                    <span className={isActive(item.path) ? "h-nav-icon-active" : "h-nav-icon"}>
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