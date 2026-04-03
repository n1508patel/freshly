import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      border: "1.5px solid #e5e7eb",
      borderRadius: "8px",
      overflow: "hidden",
      width: "100%"
    }}>
      <input
        type="text"
        placeholder="Search for products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        style={{
          flex: 1,
          padding: "11px 16px",
          border: "none",
          outline: "none",
          fontSize: "14px",
          color: "#333"
        }}
      />
      <button
        onClick={handleSearch}
        style={{
          padding: "11px 18px",
          
          color: "white",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          fontSize: "14px"
        }}
      >
        <FaSearch size={15} />
      </button>
    </div>
  );
}