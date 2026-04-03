import { useEffect, useState, useCallback } from "react";

const API = "http://localhost:8081";
const REFRESH_INTERVAL = 30_000;

const STATUS_STYLE = {
  delivered:  { background: "#E8F7F1", color: "#0F6E56" },
  processing: { background: "#E6F1FB", color: "#185FA5" },
  pending:    { background: "#FAEEDA", color: "#854F0B" },
  cancelled:  { background: "#FCEBEB", color: "#A32D2D" },
};

const ALL_STATUSES = ["all", "pending", "processing", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [refreshing, setRefreshing]   = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId]   = useState(null);

  // ── Fetch orders ────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/orders`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : data.orders || []);
      setLastUpdated(new Date());
    } catch {
      setError("Could not connect to the server. Make sure your backend is running on port 8081.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // ── Update order status ─────────────────────────────────────────────────
  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${API}/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch {
      alert("Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Filtered list ───────────────────────────────────────────────────────
  const filtered = orders
    .filter((o) => statusFilter === "all" || o.status === statusFilter)
    .filter((o) => {
      const q = search.toLowerCase();
      return (
        !q ||
        String(o._id).toLowerCase().includes(q) ||
        (o.userId?.name || o.customerName || "").toLowerCase().includes(q) ||
        (o.status || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // ── Summary counts ──────────────────────────────────────────────────────
  const counts = {
    total:     orders.length,
    pending:   orders.filter((o) => o.status === "pending").length,
    processing:orders.filter((o) => o.status === "processing").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  if (loading) return <div style={s.centered}>Loading orders...</div>;
  if (error)   return <div style={s.errorBox}>{error}</div>;

  return (
    <div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select:focus, input:focus { outline: none; }
        tr:hover td { background: #fafaf8; }
      `}</style>

      {/* Header */}
      <div style={s.topbar}>
        <div>
          <h1 style={s.pageTitle}>Orders</h1>
          <p style={s.pageSubtitle}>{orders.length} total orders</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {lastUpdated && (
            <span style={s.lastUpdated}>
              Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            style={{ ...s.refreshBtn, opacity: refreshing ? 0.6 : 1 }}
          >
            <span style={{ display: "inline-block", animation: refreshing ? "spin 0.8s linear infinite" : "none" }}>↻</span>
            {" "}{refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={s.statsGrid}>
        <SummaryCard label="Total Revenue"  value={`$${totalRevenue.toFixed(2)}`} color="#0F6E56" />
        <SummaryCard label="Total Orders"   value={counts.total}                  color="#1a1a18" />
        <SummaryCard label="Pending"        value={counts.pending}                color="#854F0B" />
        <SummaryCard label="Processing"     value={counts.processing}             color="#185FA5" />
        <SummaryCard label="Delivered"      value={counts.delivered}              color="#0F6E56" />
        <SummaryCard label="Cancelled"      value={counts.cancelled}              color="#A32D2D" />
      </div>

      {/* Filters */}
      <div style={s.filterRow}>
        <input
          style={s.searchInput}
          placeholder="Search by order ID, customer, status…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={s.statusTabs}>
          {ALL_STATUSES.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                ...s.tab,
                ...(statusFilter === st ? s.tabActive : {}),
              }}
            >
              {st.charAt(0).toUpperCase() + st.slice(1)}
              {st !== "all" && (
                <span style={s.tabCount}>{counts[st] ?? 0}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div style={s.card}>
        {filtered.length === 0 ? (
          <div style={s.emptyMsg}>No orders match your filters.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {["Order ID", "Customer", "Items", "Amount", "Date", "Status", "Action"].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order._id}>
                  <td style={s.td}>
                    <span style={s.orderId}>#{String(order._id).slice(-6).toUpperCase()}</span>
                  </td>
                  <td style={s.td}>
                    <div style={s.customerName}>{order.userId?.name || order.customerName || "Guest"}</div>
                    {order.userId?.email || order.customerEmail
                      ? <div style={s.customerEmail}>{order.userId?.email || order.customerEmail}</div>
                      : null}
                  </td>
                  <td style={s.td}>
                    <span style={s.itemCount}>
                      {order.items?.length ?? order.products?.length ?? "—"} item(s)
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={s.amount}>${(order.totalAmount || 0).toFixed(2)}</span>
                  </td>
                  <td style={s.td}>
                    <span style={s.date}>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })
                        : "—"}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={{ ...s.statusBadge, ...(STATUS_STYLE[order.status] || STATUS_STYLE.pending) }}>
                      {order.status || "pending"}
                    </span>
                  </td>
                  <td style={s.td}>
                    <select
                      value={order.status || "pending"}
                      disabled={updatingId === order._id}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      style={s.select}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={s.footer}>
        Showing {filtered.length} of {orders.length} orders
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div style={s.statCard}>
      <div style={s.statLabel}>{label}</div>
      <div style={{ ...s.statValue, color }}>{value}</div>
    </div>
  );
}

const s = {
  centered:      { padding: "60px 0", textAlign: "center", color: "#9a9a95", fontSize: 14 },
  errorBox:      { padding: 20, background: "#FCEBEB", color: "#A32D2D", borderRadius: 10, fontSize: 13, lineHeight: 1.6 },
  topbar:        { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  pageTitle:     { fontSize: 22, fontWeight: 600, color: "#1a1a18", margin: 0 },
  pageSubtitle:  { fontSize: 13, color: "#9a9a95", marginTop: 4 },
  lastUpdated:   { fontSize: 11, color: "#b0b0aa" },
  refreshBtn:    { background: "#F0F0EC", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#4a4a45", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 },
  statsGrid:     { display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 12, marginBottom: 20 },
  statCard:      { background: "#fff", border: "0.5px solid #e5e7e0", borderRadius: 12, padding: "14px 16px" },
  statLabel:     { fontSize: 11, color: "#9a9a95", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" },
  statValue:     { fontSize: 22, fontWeight: 700, lineHeight: 1.2 },
  filterRow:     { display: "flex", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" },
  searchInput:   { flex: 1, minWidth: 200, padding: "8px 14px", border: "0.5px solid #e5e7e0", borderRadius: 8, fontSize: 13, color: "#1a1a18", background: "#fff" },
  statusTabs:    { display: "flex", gap: 6, flexWrap: "wrap" },
  tab:           { padding: "6px 14px", borderRadius: 8, border: "0.5px solid #e5e7e0", background: "#fff", fontSize: 12, color: "#6b6b66", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 500 },
  tabActive:     { background: "#1D9E75", color: "#fff", border: "0.5px solid #1D9E75" },
  tabCount:      { background: "rgba(0,0,0,0.12)", borderRadius: 99, padding: "1px 7px", fontSize: 11 },
  card:          { background: "#fff", border: "0.5px solid #e5e7e0", borderRadius: 12, overflow: "hidden" },
  table:         { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th:            { textAlign: "left", fontSize: 11, color: "#b0b0aa", textTransform: "uppercase", letterSpacing: "0.06em", padding: "12px 16px", borderBottom: "0.5px solid #e5e7e0", fontWeight: 500, background: "#fafaf8" },
  td:            { padding: "12px 16px", borderBottom: "0.5px solid #f0f0ec", color: "#4a4a45", verticalAlign: "middle" },
  orderId:       { fontFamily: "monospace", fontSize: 12, fontWeight: 600, color: "#1a1a18" },
  customerName:  { fontWeight: 500, color: "#1a1a18", fontSize: 13 },
  customerEmail: { fontSize: 11, color: "#b0b0aa", marginTop: 2 },
  itemCount:     { fontSize: 12, color: "#6b6b66" },
  amount:        { fontWeight: 600, color: "#0F6E56" },
  date:          { fontSize: 12, color: "#9a9a95" },
  statusBadge:   { display: "inline-block", fontSize: 11, padding: "3px 9px", borderRadius: 999, fontWeight: 500, textTransform: "capitalize" },
  select:        { padding: "5px 8px", borderRadius: 7, border: "0.5px solid #e5e7e0", fontSize: 12, color: "#4a4a45", background: "#fafaf8", cursor: "pointer" },
  emptyMsg:      { padding: "40px 0", textAlign: "center", color: "#b0b0aa", fontSize: 13 },
  footer:        { marginTop: 12, fontSize: 12, color: "#b0b0aa", textAlign: "right" },
};