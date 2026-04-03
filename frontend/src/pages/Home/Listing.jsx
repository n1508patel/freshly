import Sidebar from "../../components/Sidebar";
import { IoMenu } from "react-icons/io5";
import { CgMenuGridO } from "react-icons/cg";
import { BsGridFill } from "react-icons/bs";
import { TfiLayoutGrid3Alt } from "react-icons/tfi";
import { FaAngleDown,  FaEdit } from "react-icons/fa";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ProductItem from "../../components/ProductItem";
import ProductModal from "../../components/ProductModal";

/* =========================
   CATEGORY SLIDER ROW
========================= */
function CategorySlider({ cat, products, onOpenModal, gridCols }) {
  const scrollRef = useRef(null);
  const SCROLL_AMOUNT = 900;
  const hasSlider = products.length > 4;

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
        behavior: "smooth",
      });
    }
  };

  const itemWidth =
    { 1: "100%", 2: "calc(50% - 8px)", 3: "calc(33.33% - 11px)", 4: "200px" }[
      gridCols
    ] || "200px";

  return (
    <div className="categorySection mb-4">
      {/* Category Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <h5 className="categoryTitle" style={{ margin: 0 }}>
          {cat}
          <span
            style={{
              marginLeft: "8px",
              fontSize: "13px",
              fontWeight: 400,
              color: "#888",
            }}
          >
            ({products.length})
          </span>
        </h5>

       
      </div>

      {/* Scrollable / Wrappable Product Row */}
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          gap: "16px",
          overflowX: gridCols === 1 ? "auto" : "visible",
          flexWrap: gridCols === 1 ? "nowrap" : "wrap",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          paddingBottom: "8px",
        }}
      >
        {products.map((item, i) => (
          <div
            key={i}
            style={{
              minWidth: itemWidth,
              maxWidth: itemWidth,
              flexShrink: 0,
            }}
          >
            <ProductItem product={item} onOpenModal={onOpenModal} />
          </div>
        ))}
      </div>

      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}

/* =========================
   MAIN LISTING PAGE
========================= */
const Listing = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const openDropdown = Boolean(anchorEl);
  const [gridCols, setGridCols] = useState(4);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAvailability, setSelectedAvailability] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100]);

  // FIX: Default to Infinity so ALL products are visible immediately
  const [showCount, setShowCount] = useState(Infinity);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get("http://localhost:8081/api/products");
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleClick = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleShowCount = (n) => {
    setShowCount(n);
    handleClose();
  };

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  if (loading) {
    return <h2 className="text-center mt-5">Loading products...</h2>;
  }

  const filteredProducts = products.filter((p) => {
    const categoryMatch =
      selectedCategories.length === 0 || selectedCategories.includes(p.category);
    const availabilityMatch =
      selectedAvailability.length === 0 ||
      selectedAvailability.includes(p.availability);
    const brandMatch =
      selectedBrands.length === 0 || selectedBrands.includes(p.brand);
    const priceMatch = p.price >= priceRange[0] && p.price <= priceRange[1];
    return categoryMatch && availabilityMatch && brandMatch && priceMatch;
  });

  // FIX: slice with Infinity returns the full array — all products visible
  const visibleProducts =
    showCount === Infinity
      ? filteredProducts
      : filteredProducts.slice(0, showCount);

  const categoryOrder = [
    "Fruits & Vegetables",
    "Electronics",
    "Pharma",
    "Dairy",
    "Snacks",
    "Beverages",
    "Grocery & Staples",
  ];

  // Build active categories from ALL filtered products (not just visibleProducts)
  // so category headers always reflect the real data
  const activeCategories = [
    ...new Set(filteredProducts.map((p) => p.category)),
  ].sort((a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b));

  // Label for the dropdown button
  const showLabel = showCount === Infinity ? "All" : showCount;

  return (
    <section className="product_listing_Page">
      <div className="container">
        <div className="productListing">
          <Sidebar
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            selectedAvailability={selectedAvailability}
            setSelectedAvailability={setSelectedAvailability}
            selectedBrands={selectedBrands}
            setSelectedBrands={setSelectedBrands}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
          />

          <div className="content_right">
            {/* TOOLBAR */}
            <div className="showBy mt-3 mb-3 d-flex align-items-center">
              <div className="d-flex btnWrapper">
                <button
                  className={gridCols === 1 ? "active" : ""}
                  onClick={() => setGridCols(1)}
                >
                  <IoMenu />
                </button>
                <button
                  className={gridCols === 2 ? "active" : ""}
                  onClick={() => setGridCols(2)}
                >
                  <BsGridFill />
                </button>
                <button
                  className={gridCols === 3 ? "active" : ""}
                  onClick={() => setGridCols(3)}
                >
                  <CgMenuGridO />
                </button>
                <button
                  className={gridCols === 4 ? "active" : ""}
                  onClick={() => setGridCols(4)}
                >
                  <TfiLayoutGrid3Alt />
                </button>
                <button onClick={() => console.log("Edit clicked")}>
                  <FaEdit />
                </button>
              </div>

              {/* Product count summary */}
              <span
                style={{
                  marginLeft: "12px",
                  fontSize: "13px",
                  color: "#666",
                }}
              >
                {visibleProducts.length} of {filteredProducts.length} products
              </span>

              <div className="ml-auto showByFilter">
                <button onClick={handleClick}>
                  Show {showLabel} <FaAngleDown />
                </button>
                <Menu
                  anchorEl={anchorEl}
                  open={openDropdown}
                  onClose={handleClose}
                >
                  {/* FIX: Infinity = show all; sensible numeric options */}
                  <MenuItem onClick={() => handleShowCount(Infinity)}>
                    All
                  </MenuItem>
                  <MenuItem onClick={() => handleShowCount(50)}>50</MenuItem>
                  <MenuItem onClick={() => handleShowCount(100)}>100</MenuItem>
                </Menu>
              </div>
            </div>

            {/* EMPTY STATE */}
            {filteredProducts.length === 0 && (
              <div className="noProducts">
                <h4>No products found</h4>
                <p>Try changing filters</p>
              </div>
            )}

            {/* CATEGORY SLIDERS — each category gets its own row */}
            {activeCategories.map((cat) => (
              <CategorySlider
                key={cat}
                cat={cat}
                products={visibleProducts.filter((p) => p.category === cat)}
                onOpenModal={handleOpenModal}
                gridCols={gridCols}
              />
            ))}
          </div>
        </div>
      </div>

      <ProductModal
        open={modalOpen}
        product={selectedProduct}
        close={handleCloseModal}
      />
    </section>
  );
};

export default Listing;