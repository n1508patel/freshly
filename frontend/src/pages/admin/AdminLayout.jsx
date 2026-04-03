import { NavLink, Outlet, useNavigate } from "react-router-dom";

const NAV = [
  {
    label: "Dashboard",
    to: "/admin",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9" />
        <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5" />
        <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5" />
        <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5" />
      </svg>
    ),
  },
  {
    label: "Orders",
    to: "/admin/orders",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
        <line x1="5" y1="5" x2="11" y2="5" stroke="currentColor" strokeWidth="1.2" />
        <line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1.2" />
        <line x1="5" y1="11" x2="8" y2="11" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    label: "Products",
    to: "/admin/products",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <path d="M2 5l6-4 6 4v6l-6 4-6-4V5z" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div style={styles.root}>
      {/* ── Sidebar ── */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>Admin
          <span style={styles.logoAccent}></span>
          <span style={styles.logoTag}></span>
        </div>

        <nav style={styles.nav}>
          <p style={styles.navSection}>Main</p>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              })}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <p style={{ ...styles.navSection, marginTop: 24 }}>Store</p>
          <button
            style={styles.navItem}
            onClick={() => navigate("/")}
          >
            <span style={styles.navIcon}>
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                <path d="M2 8h12M8 2l6 6-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Back to Shop
          </button>
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.adminBadge}>Admin</div>
          <span style={styles.adminName}>Freshly Admin</span>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  root: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#F6F7F5",
    color: "#1a1a18",
  },
  sidebar: {
    width: 224,
    background: "#fff",
    borderRight: "0.5px solid #e5e7e0",
    display: "flex",
    flexDirection: "column",
    padding: "24px 0",
    flexShrink: 0,
    position: "sticky",
    top: 0,
    height: "100vh",
  },
  logo: {
    padding: "0 20px 24px",
    fontSize: 20,
    fontWeight: 600,
    letterSpacing: "-0.5px",
    color: "#1a1a18",
  },
  logoAccent: { color: "#1D9E75" },
  logoTag: {
    fontSize: 11,
    color: "#9a9a95",
    fontWeight: 400,
    marginLeft: 6,
  },
  nav: { flex: 1 },
  navSection: {
    fontSize: 10,
    color: "#b0b0aa",
    padding: "0 20px 6px",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    fontWeight: 500,
    margin: 0,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 20px",
    fontSize: 13.5,
    color: "#6b6b66",
    textDecoration: "none",
    borderLeft: "2px solid transparent",
    cursor: "pointer",
    background: "none",
    border: "none",
    width: "100%",
    textAlign: "left",
    transition: "all 0.15s",
    borderLeft: "2px solid transparent",
  },
  navItemActive: {
    color: "#0F6E56",
    background: "#E8F7F1",
    borderLeft: "2px solid #1D9E75",
    fontWeight: 500,
  },
  navIcon: { display: "flex", alignItems: "center", opacity: 0.8 },
  sidebarFooter: {
    padding: "16px 20px",
    borderTop: "0.5px solid #e5e7e0",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  adminBadge: {
    background: "#E8F7F1",
    color: "#0F6E56",
    fontSize: 11,
    padding: "3px 8px",
    borderRadius: 999,
    fontWeight: 500,
  },
  adminName: { fontSize: 13, color: "#6b6b66" },
  main: {
    flex: 1,
    padding: "28px 32px",
    overflowY: "auto",
  },
};