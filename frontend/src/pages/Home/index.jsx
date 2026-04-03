import HomeBanner from "../../components/HomeBanner";
import HomeCat from "../../components/HomeCat";
import { useEffect, useState, useRef } from "react";
import { FaStar, FaChevronLeft, FaChevronRight, FaHeart, FaExpand } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../../context/CartContext";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8081/api/products")
      .then(res => res.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const snacksAndBeverages = products.filter(p =>
    p.category === "Snacks" || p.category === "Beverages"
  );
  const dairy = products.filter(p =>
    p.category?.toLowerCase().includes("dairy")
  );

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh" }}>
      <HomeBanner />
      <HomeCat />
      <BestSellerSection products={snacksAndBeverages} loading={loading} />
      {dairy.length > 0 && (
        <CategorySliderSection
          title="Dairy"
          subtitle="Fresh every morning"
          products={dairy}
          loading={loading}
          bannerBg="linear-gradient(135deg, #3b82f6, #60a5fa)"
          bannerText="FRESH DAIRY!"
          bannerImg="https://images.pexels.com/photos/236010/pexels-photo-236010.jpeg?w=400"
        />
      )}
      <div style={{ paddingBottom: "40px" }} />
    </div>
  );
};

// ======= REUSABLE SLIDER WITH INSIDE ARROWS =======
const SliderWithArrows = ({ scrollRef, loading, products }) => {
  const scroll = (dir) =>
    scrollRef.current?.scrollBy({ left: dir * 900, behavior: "smooth" });

  return (
    <div style={{ position: "relative" }}>
      {/* LEFT arrow — 4px inside left edge */}
      <button onClick={() => scroll(-1)} style={arrowStyle("left")}>
        <FaChevronLeft size={13} />
      </button>

      {/* Clip the scrollable row but arrows overlay on top */}
      <div style={{ overflow: "hidden" }}>
        {loading ? (
          <p style={{ color: "#888" }}>Loading...</p>
        ) : (
          <div
            ref={scrollRef}
            style={{
              display: "flex",
              gap: "16px",
              overflowX: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              paddingBottom: "8px",
              paddingLeft: "8px",
              paddingRight: "6px",
            }}
          >
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>

      {/* RIGHT arrow — 4px inside right edge */}
      <button onClick={() => scroll(1)} style={arrowStyle("right")}>
        <FaChevronRight size={13} />
      </button>
    </div>
  );
};

// Arrow overlays INSIDE the slider — inset from edge, not outside
const arrowStyle = (side) => ({
  position: "absolute",
  [side]: "6px",         // inside edge
  top: "42%",
  transform: "translateY(-50%)",
  zIndex: 10,
  width: "34px",
  height: "34px",
  borderRadius: "50%",
  border: "1px solid #e5e7eb",
  background: "white",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 8px rgba(0,0,0,0.13)",
  padding: 0,
  color: "#555",
});

// ======= BEST SELLERS =======
const BestSellerSection = ({ products, loading }) => {
  const scrollRef = useRef(null);

  return (
    <div style={{ padding: "32px 32px 0", display: "flex", gap: "20px" }}>
      {/* Left Banners */}
      <div style={{
        display: "flex", flexDirection: "column", gap: "16px",
        minWidth: "220px", maxWidth: "220px"
      }}>
        <div style={{ borderRadius: "12px", height: "200px", overflow: "hidden", position: "relative" }}>
          <img src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=400"
            alt="offer" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{
            position: "absolute", inset: 0, background: "rgba(245,158,11,0.65)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ color: "white", fontWeight: "800", fontSize: "22px", textAlign: "center" }}>
              BEST<br />SELLERS!
            </span>
          </div>
        </div>
        <div style={{ borderRadius: "12px", height: "200px", overflow: "hidden", position: "relative" }}>
          <img src="https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?w=400"
            alt="offer2" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{
            position: "absolute", inset: 0, background: "rgba(249,115,22,0.65)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ color: "white", fontWeight: "800", fontSize: "18px", textAlign: "center" }}>
              GOLDEN OFFER!<br />USE IT PROPER!
            </span>
          </div>
        </div>
      </div>

      {/* Right Slider */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: "20px"
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "700" }}>BEST SELLERS</h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>
              Do not miss current offers
            </p>
          </div>
          <a href="/shop" style={{
            color: "#333", fontSize: "13px", fontWeight: "600",
            textDecoration: "none", border: "1px solid #ddd",
            padding: "7px 16px", borderRadius: "20px"
          }}>View All →</a>
        </div>

        <SliderWithArrows scrollRef={scrollRef} loading={loading} products={products} />
      </div>
    </div>
  );
};

// ======= CATEGORY SLIDER =======
const CategorySliderSection = ({
  title, subtitle, products, loading, bannerBg, bannerText, bannerImg
}) => {
  const scrollRef = useRef(null);

  return (
    <div style={{ padding: "32px 32px 0", display: "flex", gap: "20px" }}>
      {/* Left Banner */}
      <div style={{
        borderRadius: "12px", minWidth: "220px", maxWidth: "220px",
        height: "420px", overflow: "hidden", position: "relative", background: bannerBg
      }}>
        <img src={bannerImg} alt="banner"
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.55 }} />
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <span style={{
            color: "white", fontWeight: "800", fontSize: "24px",
            textAlign: "center", textShadow: "0 2px 6px rgba(0,0,0,0.3)"
          }}>{bannerText}</span>
        </div>
      </div>

      {/* Right Slider */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: "20px"
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "700" }}>{title}</h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>{subtitle}</p>
          </div>
        </div>

        <SliderWithArrows scrollRef={scrollRef} loading={loading} products={products} />
      </div>
    </div>
  );
};

// ======= PRODUCT CARD — no Add button =======
const ProductCard = ({ product }) => {
  const [hovered, setHovered] = useState(false);
  const [wished, setWished] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/product/${product._id}`)}
      style={{
        minWidth: "200px", maxWidth: "200px",
        background: "white", borderRadius: "16px",
        overflow: "hidden", border: "1px solid #e5e7eb",
        boxShadow: hovered ? "0 8px 28px rgba(0,0,0,0.1)" : "0 1px 4px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-4px)" : "none",
        transition: "all 0.25s ease",
        cursor: "pointer", flexShrink: 0, position: "relative"
      }}
    >
      {/* Discount Badge */}
      {product.discount && (
        <div style={{
          position: "absolute", top: "10px", left: "10px",
          background: "#16a34a", color: "white",
          fontSize: "11px", fontWeight: "700",
          padding: "3px 8px", borderRadius: "6px", zIndex: 2
        }}>{product.discount}</div>
      )}

      {/* Hover Icons */}
      {hovered && (
        <div style={{
          position: "absolute", top: "10px", right: "10px",
          display: "flex", flexDirection: "column", gap: "6px", zIndex: 2
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); setWished(!wished); }}
            style={iconBtn}
          >
            <FaHeart size={13} color={wished ? "#dc2626" : "#bbb"} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/product/${product._id}`); }}
            style={iconBtn}
          >
            <FaExpand size={12} color="#888" />
          </button>
        </div>
      )}

      {/* Image */}
      <div style={{
        background: "#f9fafb", padding: "20px", textAlign: "center",
        height: "180px", display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <img
          src={product.imgs?.[0]}
          alt={product.name}
          style={{ maxWidth: "140px", maxHeight: "140px", objectFit: "contain" }}
          onError={e => e.target.src = "https://via.placeholder.com/140"}
        />
      </div>

      {/* Info */}
      <div style={{ padding: "14px" }}>
        <h4 style={{
          margin: "0 0 8px", fontSize: "14px", fontWeight: "600",
          color: "#1a1a1a", lineHeight: 1.3,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "36px"
        }}>{product.name}</h4>

        {product.rating && (
          <div style={{ display: "flex", gap: "3px", marginBottom: "10px" }}>
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} size={12}
                color={i < Math.floor(product.rating) ? "#f59e0b" : "#e5e7eb"} />
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px", fontWeight: "700", color: "#dc2626" }}>
            ${product.price}
          </span>
          {product.old && (
            <span style={{ fontSize: "12px", color: "#aaa", textDecoration: "line-through" }}>
              ${product.old}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ======= ICON BTN =======
const iconBtn = {
  width: "32px", height: "32px", borderRadius: "50%",
  background: "white", border: "1px solid #e5e7eb",
  cursor: "pointer", display: "flex",
  alignItems: "center", justifyContent: "center",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)", padding: 0
};

export default Home;