import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Rating from "@mui/material/Rating";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import IconButton from "@mui/material/IconButton";
import { useCart } from "../context/CartContext";  // ✅ import cart

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();  // ✅ get addToCart

  const [product, setProduct] = useState(null);
  const [active, setActive] = useState("");
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [added, setAdded] = useState(false);  // ✅ feedback state
  const imgRef = useRef(null);

  useEffect(() => {
    axios
      .get(`http://localhost:8081/api/products/${id}`)
      .then(({ data }) => {
        setProduct(data);
        setActive(data.imgs?.[0]);
      })
      .catch((err) => console.error(err));
  }, [id]);

  const handleThumb = (img) => { setActive(img); setZoom(1); setPos({ x: 0, y: 0 }); };
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.5, 3));
  const handleZoomOut = () => { setZoom((z) => { const next = Math.max(z - 0.5, 1); if (next === 1) setPos({ x: 0, y: 0 }); return next; }); };
  const handleMouseDown = (e) => { if (zoom <= 1) return; setDragging(true); setStartPos({ x: e.clientX - pos.x, y: e.clientY - pos.y }); };
  const handleMouseMove = (e) => { if (!dragging) return; setPos({ x: e.clientX - startPos.x, y: e.clientY - startPos.y }); };
  const handleMouseUp = () => setDragging(false);
  const handleWheel = (e) => { e.preventDefault(); if (e.deltaY < 0) handleZoomIn(); else handleZoomOut(); };

  // ✅ Add to cart handler
  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!product) return (
    <div style={{ padding: "60px", textAlign: "center", color: "#888" }}>
      Loading product...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>

      {/* TOP BAR */}
      <div style={{ backgroundColor: "white", borderBottom: "1px solid #e5e7eb", padding: "14px 32px", display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: "#16a34a", fontWeight: "600", fontSize: "14px" }}>
          <ArrowBackIcon fontSize="small" /> Back
        </button>
        <span style={{ color: "#ccc" }}>|</span>
        <span style={{ fontSize: "13px", color: "#888" }}>
          {product.category} / <b style={{ color: "#333" }}>{product.name}</b>
        </span>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: "1100px", margin: "40px auto", padding: "0 24px", display: "flex", gap: "48px", alignItems: "flex-start" }}>

        {/* LEFT: IMAGES */}
        <div style={{ flex: "0 0 480px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <IconButton onClick={handleZoomOut} disabled={zoom <= 1} size="small" style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "4px" }}>
              <ZoomOutIcon style={{ fontSize: "18px" }} />
            </IconButton>
            <span style={{ fontSize: "13px", color: "#666", minWidth: "40px", textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
            <IconButton onClick={handleZoomIn} disabled={zoom >= 3} size="small" style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "4px" }}>
              <ZoomInIcon style={{ fontSize: "18px" }} />
            </IconButton>
            {zoom > 1 && <span style={{ fontSize: "11px", color: "#aaa" }}>drag to pan · scroll to zoom</span>}
          </div>

          <div
            style={{ overflow: "hidden", borderRadius: "16px", border: "1px solid #e5e7eb", cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default", width: "100%", height: "420px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "white", userSelect: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onWheel={handleWheel}
          >
            <img ref={imgRef} src={active} alt={product.name}
              style={{ transform: `scale(${zoom}) translate(${pos.x / zoom}px, ${pos.y / zoom}px)`, transition: dragging ? "none" : "transform 0.2s ease", maxWidth: "100%", maxHeight: "100%", objectFit: "contain", pointerEvents: "none" }}
              draggable={false}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
            {product.imgs?.map((img, i) => (
              <img key={i} src={img} alt="" onClick={() => handleThumb(img)}
                style={{ width: "70px", height: "70px", objectFit: "contain", borderRadius: "10px", border: active === img ? "2px solid #16a34a" : "2px solid #e5e7eb", cursor: "pointer", backgroundColor: "white", padding: "4px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              />
            ))}
          </div>
        </div>

        {/* RIGHT: INFO */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
          <span style={{ display: "inline-block", backgroundColor: "#dcfce7", color: "#16a34a", fontSize: "12px", fontWeight: "600", padding: "4px 12px", borderRadius: "20px", width: "fit-content" }}>IN STOCK</span>

          <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "700", color: "#1a1a1a", lineHeight: "1.3" }}>{product.name}</h1>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Rating value={product.rating || 4.5} precision={0.5} readOnly />
            <span style={{ fontSize: "13px", color: "#888" }}>({product.reviews || 12} reviews)</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "28px", fontWeight: "700", color: "#16a34a" }}>${product.price}</span>
            {product.old && <span style={{ fontSize: "18px", color: "#aaa", textDecoration: "line-through" }}>${product.old}</span>}
            {product.discount && (
              <span style={{ backgroundColor: "#fef9c3", color: "#ca8a04", fontSize: "12px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px" }}>
                {product.discount}
              </span>
            )}
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #f0f0f0" }} />

          <p style={{ margin: 0, fontSize: "14px", color: "#555", lineHeight: "1.7" }}>{product.description}</p>

          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
            <li style={{ fontSize: "14px", color: "#444" }}>✔ Type: {product.type || "Organic"}</li>
            <li style={{ fontSize: "14px", color: "#444" }}>✔ MFG: {product.mfg || "Jun 2025"}</li>
            <li style={{ fontSize: "14px", color: "#444" }}>✔ Life: {product.life || "30 Days"}</li>
            {product.brand && <li style={{ fontSize: "14px", color: "#444" }}>✔ Brand: {product.brand}</li>}
          </ul>

          {/* QUANTITY + ADD TO CART */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <button onClick={() => setQty(qty > 1 ? qty - 1 : 1)} style={{ width: "36px", height: "36px", border: "1px solid #e5e7eb", borderRadius: "8px 0 0 8px", background: "#f9fafb", fontSize: "18px", cursor: "pointer", fontWeight: "600" }}>−</button>
              <span style={{ width: "44px", height: "36px", border: "1px solid #e5e7eb", borderLeft: "none", borderRight: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600" }}>{qty}</span>
              <button onClick={() => setQty(qty + 1)} style={{ width: "36px", height: "36px", border: "1px solid #e5e7eb", borderRadius: "0 8px 8px 0", background: "#f9fafb", fontSize: "18px", cursor: "pointer", fontWeight: "600" }}>+</button>
            </div>

            {/* ✅ WIRED UP ADD TO CART */}
            <button
              onClick={handleAddToCart}
              style={{
                padding: "10px 32px",
                backgroundColor: added ? "#16a34a" : "#1e3a5f",
                color: "white", border: "none", borderRadius: "30px",
                fontSize: "15px", fontWeight: "600", cursor: "pointer",
                transition: "background 0.3s",
              }}
            >
              {added ? "✅ Added to Cart!" : "Add to cart"}
            </button>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", border: "1px solid #e5e7eb", borderRadius: "8px", background: "white", cursor: "pointer", fontSize: "13px", color: "#444" }}>
              <FavoriteBorderIcon style={{ fontSize: "16px" }} /> Add to Wishlist
            </button>
            <button style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", border: "1px solid #e5e7eb", borderRadius: "8px", background: "white", cursor: "pointer", fontSize: "13px", color: "#444" }}>
              <CompareArrowsIcon style={{ fontSize: "16px" }} /> Compare
            </button>
          </div>

          <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "5px" }}>
            <span style={{ fontSize: "13px", color: "#888" }}>Category: <b style={{ color: "#444" }}>{product.category}</b></span>
            <span style={{ fontSize: "13px", color: "#888" }}>
              Tags:{" "}
              {product.tags?.map((tag, i) => (
                <b key={i} style={{ color: "#444" }}>{tag}{i !== product.tags.length - 1 && ", "}</b>
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}