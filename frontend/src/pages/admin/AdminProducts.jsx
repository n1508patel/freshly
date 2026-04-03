import { useEffect, useState } from "react";

const API = "http://localhost:8081";

const CATEGORIES = ["Fruits & Veg", "Dairy", "Bakery", "Beverages", "Snacks", "Frozen", "Personal Care"];

const EMPTY_FORM = {
  name: "",
  category: CATEGORIES[0],
  price: "",
  stock: "",
  image: "",
  description: "",
};

function stockLevel(stock) {
  if (stock === 0)  return { label: "Out of stock", bg: "#FCEBEB", color: "#A32D2D", dot: "#E24B4A" };
  if (stock < 10)   return { label: "Low stock",    bg: "#FAEEDA", color: "#854F0B", dot: "#EF9F27" };
  return               { label: "In stock",       bg: "#E8F7F1", color: "#0F6E56", dot: "#1D9E75" };
}

export default function AdminProducts() {
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState("");
  const [catFilter, setCatFilter]       = useState("All");
  const [showModal, setShowModal]       = useState(false);
  const [editProduct, setEditProduct]   = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [formError, setFormError]       = useState("");
  const [saving, setSaving]             = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/products`);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (err) {
      setError(`Could not load products. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name:        product.name        || "",
      category:    product.category    || CATEGORIES[0],
      price:       product.price       ?? "",
      stock:       product.stock       ?? "",
      image:       product.image       || "",
      description: product.description || "",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim())  { setFormError("Product name is required."); return; }
    if (!form.price)        { setFormError("Price is required."); return; }
    setFormError("");
    setSaving(true);

    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock) || 0,
    };

    try {
      if (editProduct) {
        const res = await fetch(`${API}/api/products/${editProduct._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        const updated = await res.json();
        setProducts((prev) =>
          prev.map((p) => (p._id === editProduct._id ? updated : p))
        );
      } else {
        const res = await fetch(`${API}/api/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        const created = await res.json();
        setProducts((prev) => [created, ...prev]);
      }
      setShowModal(false);
    } catch {
      setFormError("Failed to save product. Please check your server and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/api/products/${id}`, { method: "DELETE" });
    } catch {}
    setProducts((prev) => prev.filter((p) => p._id !== id));
    setDeleteConfirm(null);
  };

  const allCategories = ["All", ...new Set(products.map((p) => p.category).filter(Boolean))];

  const filtered = products.filter((p) => {
    const matchSearch = (p.name || "").toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === "All" || p.category === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <div>
      {/* Top Bar */}
      <div style={s.topbar}>
        <div>
          <h1 style={s.pageTitle}>Products</h1>
          <p style={s.pageSubtitle}>{products.length} total products</p>
        </div>
        <div style={s.topbarRight}>
          <input
            style={s.searchInput}
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button style={s.addBtn} onClick={openAdd}>+ Add Product</button>
        </div>
      </div>

      {/* Category Filter */}
      <div style={s.tabs}>
        {allCategories.map((cat) => (
          <button
            key={cat}
            style={{ ...s.tab, ...(catFilter === cat ? s.tabActive : {}) }}
            onClick={() => setCatFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={s.card}>
        {loading ? (
          <div style={s.empty}>Loading products...</div>
        ) : error ? (
          <div style={s.errorBox}>{error}</div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            {products.length === 0
              ? "No products yet. Click \"+ Add Product\" to get started."
              : "No products match your search."}
          </div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {["Product", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const sl = stockLevel(product.stock ?? 0);
                return (
                  <tr key={product._id}>
                    <td style={s.td}>
                      <div style={s.productCell}>
                        <div style={s.productThumb}>
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
                            />
                          ) : (
                            <span style={{ fontSize: 18 }}></span>
                          )}
                        </div>
                        <div>
                          <div style={s.productName}>{product.name}</div>
                          {product.description && (
                            <div style={s.productDesc}>{product.description.slice(0, 44)}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={s.td}>
                      <span style={s.catTag}>{product.category || "—"}</span>
                    </td>
                    <td style={{ ...s.td, fontWeight: 600, color: "#0F6E56" }}>
                      ${(product.price || 0).toFixed(2)}
                    </td>
                    <td style={s.td}>
                      <div style={s.stockCell}>
                        <span style={{ ...s.stockDot, background: sl.dot }} />
                        {product.stock ?? 0} units
                      </div>
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.stockBadge, background: sl.bg, color: sl.color }}>
                        {sl.label}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={s.actions}>
                        <button style={s.editBtn}   onClick={() => openEdit(product)}>Edit</button>
                        <button style={s.deleteBtn} onClick={() => setDeleteConfirm(product._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <span style={s.modalTitle}>{editProduct ? "Edit Product" : "Add Product"}</span>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div style={s.formGrid}>
              <div style={s.formGroup}>
                <label style={s.label}>Product Name *</label>
                <input
                  style={s.input}
                  placeholder="e.g. Red Apples (1kg)"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Category</label>
                <select
                  style={s.input}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Price ($) *</label>
                <input
                  style={s.input}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Stock (units)</label>
                <input
                  style={s.input}
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Image URL</label>
                <input
                  style={s.input}
                  placeholder="https://..."
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
              </div>
              <div style={{ ...s.formGroup, gridColumn: "span 2" }}>
                <label style={s.label}>Description</label>
                <input
                  style={s.input}
                  placeholder="Short product description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>

            {formError && <p style={s.formError}>{formError}</p>}

            <div style={s.modalFooter}>
              <button style={s.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button
                style={{ ...s.saveBtn, opacity: saving ? 0.7 : 1 }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : editProduct ? "Update Product" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div style={s.overlay} onClick={() => setDeleteConfirm(null)}>
          <div style={{ ...s.modal, maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <span style={s.modalTitle}>Delete Product</span>
            </div>
            <p style={{ padding: "4px 20px 20px", color: "#6b6b66", fontSize: 14, lineHeight: 1.6 }}>
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div style={s.modalFooter}>
              <button style={s.cancelBtn} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button style={{ ...s.saveBtn, background: "#E24B4A" }} onClick={() => handleDelete(deleteConfirm)}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  topbar:       { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 16 },
  pageTitle:    { fontSize: 22, fontWeight: 600, color: "#1a1a18", margin: 0 },
  pageSubtitle: { fontSize: 13, color: "#9a9a95", marginTop: 4 },
  topbarRight:  { display: "flex", gap: 10, alignItems: "center" },
  searchInput:  { padding: "8px 14px", fontSize: 13, border: "0.5px solid #d0d0ca", borderRadius: 8, outline: "none", width: 220, background: "#fff", color: "#1a1a18" },
  addBtn:       { padding: "8px 16px", fontSize: 13, background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 500, fontFamily: "inherit" },
  tabs:         { display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" },
  tab:          { padding: "6px 14px", fontSize: 12, border: "0.5px solid #e5e7e0", borderRadius: 8, background: "#fff", color: "#6b6b66", cursor: "pointer", fontFamily: "inherit" },
  tabActive:    { background: "#E8F7F1", color: "#0F6E56", borderColor: "#9FE1CB", fontWeight: 500 },
  card:         { background: "#fff", border: "0.5px solid #e5e7e0", borderRadius: 12, overflow: "hidden" },
  empty:        { padding: "56px 20px", textAlign: "center", color: "#b0b0aa", fontSize: 14, lineHeight: 1.7 },
  errorBox:     { padding: 20, background: "#FCEBEB", color: "#A32D2D", fontSize: 13, lineHeight: 1.6 },
  table:        { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th:           { textAlign: "left", fontSize: 11, color: "#b0b0aa", textTransform: "uppercase", letterSpacing: "0.06em", padding: "12px 16px", borderBottom: "0.5px solid #e5e7e0", fontWeight: 500 },
  td:           { padding: "12px 16px", borderBottom: "0.5px solid #F5F5F2", color: "#4a4a45", verticalAlign: "middle" },
  productCell:  { display: "flex", alignItems: "center", gap: 12 },
  productThumb: { width: 38, height: 38, borderRadius: 8, background: "#F6F7F5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" },
  productName:  { fontSize: 13, fontWeight: 500, color: "#1a1a18" },
  productDesc:  { fontSize: 11, color: "#b0b0aa", marginTop: 2 },
  catTag:       { background: "#F6F7F5", color: "#6b6b66", fontSize: 11, padding: "3px 8px", borderRadius: 6, fontWeight: 500 },
  stockCell:    { display: "flex", alignItems: "center", gap: 6 },
  stockDot:     { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  stockBadge:   { display: "inline-block", fontSize: 11, padding: "3px 9px", borderRadius: 999, fontWeight: 500 },
  actions:      { display: "flex", gap: 6 },
  editBtn:      { padding: "5px 12px", fontSize: 12, border: "0.5px solid #d0d0ca", borderRadius: 6, background: "#fff", color: "#4a4a45", cursor: "pointer", fontFamily: "inherit" },
  deleteBtn:    { padding: "5px 12px", fontSize: 12, border: "0.5px solid #f0c0c0", borderRadius: 6, background: "#fff", color: "#A32D2D", cursor: "pointer", fontFamily: "inherit" },
  overlay:      { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal:        { background: "#fff", borderRadius: 14, width: "100%", maxWidth: 520 },
  modalHeader:  { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px 16px", borderBottom: "0.5px solid #e5e7e0" },
  modalTitle:   { fontSize: 15, fontWeight: 600, color: "#1a1a18" },
  closeBtn:     { background: "none", border: "none", fontSize: 16, color: "#9a9a95", cursor: "pointer", padding: 4 },
  formGrid:     { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, padding: "18px 20px" },
  formGroup:    { display: "flex", flexDirection: "column", gap: 6 },
  label:        { fontSize: 12, color: "#6b6b66", fontWeight: 500 },
  input:        { padding: "8px 12px", fontSize: 13, border: "0.5px solid #d0d0ca", borderRadius: 8, outline: "none", background: "#fff", color: "#1a1a18", fontFamily: "inherit" },
  formError:    { margin: "0 20px 4px", fontSize: 12, color: "#A32D2D" },
  modalFooter:  { display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 20px", borderTop: "0.5px solid #e5e7e0" },
  cancelBtn:    { padding: "8px 16px", fontSize: 13, border: "0.5px solid #d0d0ca", borderRadius: 8, background: "#fff", color: "#6b6b66", cursor: "pointer", fontFamily: "inherit" },
  saveBtn:      { padding: "8px 18px", fontSize: 13, background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 500, fontFamily: "inherit" },
};