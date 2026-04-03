import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductItem from "../components/ProductItem";

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get("q");

  const [products, setProducts] = useState([]);
  const [aiMessage, setAiMessage] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const searchQuery = (q) => {
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  useEffect(() => {
    if (!query) return;

    setLoading(true);
    setError(null);
    setAiMessage("");
    setSuggestions([]);

    console.log("🔍 Searching for:", query);

    fetch("http://localhost:8081/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("✅ Data received:", data);
        const productList = Array.isArray(data.products) ? data.products : [];
        setProducts(productList);
        if (data.ai) {
          setAiMessage(data.ai.message || "");
          setSuggestions(data.ai.suggestions || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Fetch error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [query]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ fontSize: "18px", color: "#666" }}>Searching...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ color: "red" }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>

      {/* Search heading */}
      <h2 style={{ marginBottom: "4px" }}>
        Showing results for "{query}"
      </h2>

      {/* AI Message */}
      {aiMessage && (
        <p style={{
          color: "#16a34a",
          fontSize: "14px",
          marginBottom: "12px",
          fontStyle: "italic"
        }}>
          🤖 {aiMessage}
        </p>
      )}

      {/* Product count */}
      <p style={{ color: "#666", marginBottom: "16px" }}>
        {products.length} product{products.length !== 1 ? "s" : ""} found
      </p>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <p style={{ fontSize: "13px", color: "#888", marginBottom: "8px" }}>
            🔎 Try searching:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => searchQuery(s)}
                style={{
                  padding: "6px 14px",
                  backgroundColor: "#f0fdf4",
                  color: "#16a34a",
                  border: "1px solid #bbf7d0",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <p style={{ fontSize: "18px", color: "#666" }}>
            No products found for "{query}"
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              marginTop: "16px",
              padding: "10px 24px",
              backgroundColor: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Back to Home
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "20px",
          }}
        >
          {products.map((product) => (
            <ProductItem key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}