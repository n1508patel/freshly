import { useEffect, useState, useCallback } from "react";

const API = "http://localhost:8081";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATUS_STYLE = {
  delivered: { background: "#E8F7F1", color: "#0F6E56" },
  processing: { background: "#E6F1FB", color: "#185FA5" },
  pending:    { background: "#FAEEDA", color: "#854F0B" },
  cancelled:  { background: "#FCEBEB", color: "#A32D2D" },
};

const REFRESH_INTERVAL = 30_000; // 30 seconds

export default function AdminDashboard() {
  const [orders, setOrders]       = useState([]);
  const [products, setProducts]   = useState([]);
  const [riders, setRiders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAll = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setError(null);
    try {
      const [ordersRes, productsRes, ridersRes] = await Promise.all([
        fetch(`${API}/api/orders`),
        fetch(`${API}/api/products`),
        fetch(`${API}/api/riders`),
      ]);

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(Array.isArray(data) ? data : data.orders || []);
      }
      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(Array.isArray(data) ? data : data.products || []);
      }
      if (ridersRes.ok) {
        const data = await ridersRes.json();
        setRiders(Array.isArray(data) ? data : data.riders || []);
      }
      setLastUpdated(new Date());
    } catch {
      setError("Could not connect to the server. Make sure your backend is running on port 8081.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => fetchAll(), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // ── Derived stats ──────────────────────────────────────────────────────
  const totalRevenue  = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const activeRiders  = riders.filter((r) => r.status === "active" || r.isAvailable).length;
  const lowStockCount = products.filter((p) => (p.stock ?? 0) < 10).length;

  // Weekly revenue: group by day-of-week from createdAt
  const weeklyRevenue = Array(7).fill(0);
  orders.forEach((o) => {
    if (!o.createdAt) return;
    const day = new Date(o.createdAt).getDay(); // 0=Sun
    const idx = day === 0 ? 6 : day - 1;        // Mon=0 … Sun=6
    weeklyRevenue[idx] += o.totalAmount || 0;
  });
  const maxWeekly = Math.max(...weeklyRevenue, 1);
  const todayIdx  = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  // Category breakdown from products
  const catMap = {};
  products.forEach((p) => {
    const cat = p.category || "Other";
    catMap[cat] = (catMap[cat] || 0) + 1;
  });
  const total      = products.length || 1;
  const categories = Object.entries(catMap)
    .map(([name, count]) => ({ name, pct: Math.round((count / total) * 100) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const topProducts = [...products]
    .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
    .slice(0, 5);

  if (loading) return <div style={s.centered}>Loading dashboard...</div>;
  if (error)   return <div style={s.errorBox}>{error}</div>;

  return (
    <div>
      {/* Top Bar */}
      <div style={s.topbar}>
        <div>
          <h1 style={s.pageTitle}>Overview</h1>
          <p style={s.pageSubtitle}>Here's what's happening today.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {lastUpdated && (
            <span style={s.lastUpdated}>
              Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            style={{ ...s.refreshBtn, opacity: refreshing ? 0.6 : 1 }}
            title="Refresh now"
          >
            <span style={{ display: "inline-block", animation: refreshing ? "spin 0.8s linear infinite" : "none" }}>
              ↻
            </span>{" "}
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          <span style={s.dateBadge}>
            {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Stat Cards */}
      <div style={s.statsGrid}>
        <StatCard label="Total Revenue"   value={`$${totalRevenue.toFixed(2)}`}        sub={`${orders.length} orders total`} />
        <StatCard label="Total Orders"    value={orders.length}                         sub="All time" />
        <StatCard label="Active Riders"   value={`${activeRiders} / ${riders.length}`} sub={`${riders.length - activeRiders} unavailable`} />
        <StatCard label="Low Stock Items" value={lowStockCount}                         sub="Below 10 units" warn={lowStockCount > 0} />
      </div>

      {/* Charts Row */}
      <div style={s.row}>
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}>Weekly Revenue</span>
          </div>
          {weeklyRevenue.every((v) => v === 0) ? (
            <div style={s.emptyMsg}>No order data for this week yet.</div>
          ) : (
            <div style={s.barChart}>
              {weeklyRevenue.map((val, i) => (
                <div key={i} style={s.barCol}>
                  {val > 0 && <span style={s.barVal}>${Math.round(val)}</span>}
                  <div
                    style={{
                      ...s.barFill,
                      height: `${Math.round((val / maxWeekly) * 100)}%`,
                      background: i === todayIdx ? "#1D9E75" : "#9FE1CB",
                    }}
                  />
                  <span style={s.barDay}>{DAYS[i]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}>Products by Category</span>
          </div>
          {categories.length === 0 ? (
            <div style={s.emptyMsg}>No products added yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {categories.map((cat) => (
                <div key={cat.name} style={s.catRow}>
                  <span style={s.catLabel}>{cat.name}</span>
                  <div style={s.catTrack}>
                    <div style={{ ...s.catFill, width: `${cat.pct}%` }} />
                  </div>
                  <span style={s.catPct}>{cat.pct}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tables Row */}
      <div style={s.row}>
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}>Recent Orders</span>
            <a href="/admin/orders" style={s.cardAction}>View all →</a>
          </div>
          {recentOrders.length === 0 ? (
            <div style={s.emptyMsg}>No orders yet.</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  {["Order ID", "Customer", "Amount", "Status"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td style={s.td}>#{String(order._id).slice(-6).toUpperCase()}</td>
                    <td style={s.td}>{order.userId?.name || order.customerName || "Guest"}</td>
                    <td style={s.td}>${(order.totalAmount || 0).toFixed(2)}</td>
                    <td style={s.td}>
                      <span style={{ ...s.statusBadge, ...(STATUS_STYLE[order.status] || STATUS_STYLE.pending) }}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}>Products</span>
            <a href="/admin/products" style={s.cardAction}>View all →</a>
          </div>
          {topProducts.length === 0 ? (
            <div style={s.emptyMsg}>No products added yet.</div>
          ) : (
            topProducts.map((product) => (
              <div key={product._id} style={s.productRow}>
                <div style={s.productThumb}>
                  {product.image ? (
                    <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
                  ) : (
                    <span style={{ fontSize: 18 }}></span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={s.productName}>{product.name}</div>
                  <div style={s.productCat}>{product.category || "—"}</div>
                </div>
                <div style={s.productPrice}>${(product.price || 0).toFixed(2)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, warn }) {
  return (
    <div style={s.statCard}>
      <div style={s.statLabel}>{label}</div>
      <div style={s.statValue}>{value}</div>
      <div style={{ ...s.statSub, color: warn ? "#A32D2D" : "#9a9a95" }}>{sub}</div>
    </div>
  );
}

const s = {
  centered:     { padding: "60px 0", textAlign: "center", color: "#9a9a95", fontSize: 14 },
  errorBox:     { padding: 20, background: "#FCEBEB", color: "#A32D2D", borderRadius: 10, fontSize: 13, lineHeight: 1.6 },
  topbar:       { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  pageTitle:    { fontSize: 22, fontWeight: 600, color: "#1a1a18", margin: 0 },
  pageSubtitle: { fontSize: 13, color: "#9a9a95", marginTop: 4 },
  dateBadge:    { background: "#E8F7F1", color: "#0F6E56", fontSize: 12, padding: "5px 12px", borderRadius: 999, fontWeight: 500 },
  lastUpdated:  { fontSize: 11, color: "#b0b0aa" },
  refreshBtn:   { background: "#F0F0EC", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#4a4a45", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 },
  statsGrid:    { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14, marginBottom: 24 },
  statCard:     { background: "#fff", border: "0.5px solid #e5e7e0", borderRadius: 12, padding: "16px 18px" },
  statLabel:    { fontSize: 12, color: "#9a9a95", marginBottom: 4 },
  statValue:    { fontSize: 24, fontWeight: 600, color: "#1a1a18", lineHeight: 1.2 },
  statSub:      { fontSize: 12, marginTop: 6 },
  row:          { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 },
  card:         { background: "#fff", border: "0.5px solid #e5e7e0", borderRadius: 12, padding: "20px 20px 16px" },
  cardHeader:   { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  cardTitle:    { fontSize: 14, fontWeight: 500, color: "#1a1a18" },
  cardAction:   { fontSize: 12, color: "#1D9E75", textDecoration: "none" },
  emptyMsg:     { padding: "24px 0", textAlign: "center", color: "#b0b0aa", fontSize: 13 },
  barChart:     { display: "flex", alignItems: "flex-end", gap: 6, height: 120, paddingBottom: 28 },
  barCol:       { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", position: "relative" },
  barFill:      { width: "100%", borderRadius: "3px 3px 0 0", minHeight: 4, transition: "height 0.5s ease" },
  barVal:       { fontSize: 9, color: "#b0b0aa", position: "absolute", top: 0 },
  barDay:       { position: "absolute", bottom: -20, fontSize: 10, color: "#b0b0aa" },
  catRow:       { display: "flex", alignItems: "center", gap: 10 },
  catLabel:     { width: 100, fontSize: 12, color: "#6b6b66", textAlign: "right", flexShrink: 0 },
  catTrack:     { flex: 1, height: 8, background: "#F0F0EC", borderRadius: 4, overflow: "hidden" },
  catFill:      { height: "100%", background: "#1D9E75", borderRadius: 4, transition: "width 0.6s ease" },
  catPct:       { width: 34, fontSize: 12, color: "#9a9a95", textAlign: "right" },
  table:        { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th:           { textAlign: "left", fontSize: 11, color: "#b0b0aa", textTransform: "uppercase", letterSpacing: "0.06em", paddingBottom: 10, borderBottom: "0.5px solid #e5e7e0", fontWeight: 500 },
  td:           { padding: "10px 0", borderBottom: "0.5px solid #f0f0ec", color: "#4a4a45", verticalAlign: "middle" },
  statusBadge:  { display: "inline-block", fontSize: 11, padding: "3px 9px", borderRadius: 999, fontWeight: 500, textTransform: "capitalize" },
  productRow:   { display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "0.5px solid #f0f0ec" },
  productThumb: { width: 38, height: 38, borderRadius: 8, background: "#F6F7F5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" },
  productName:  { fontSize: 13, fontWeight: 500, color: "#1a1a18" },
  productCat:   { fontSize: 11, color: "#b0b0aa", marginTop: 2 },
  productPrice: { marginLeft: "auto", fontSize: 13, fontWeight: 600, color: "#0F6E56" },
};