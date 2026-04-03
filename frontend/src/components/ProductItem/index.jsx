import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Rating from "@mui/material/Rating";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

const SHOW = 4;

/* =========================
   LISTING PAGE CARD
========================= */
function ListingCard({ product }) {
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="productCard">
      {product.discount && (
        <span className="discount">{product.discount}</span>
      )}

      <div className="imgTop">
        <div className="icons">
          <button onClick={() => setLiked(!liked)}>
            {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </button>

          <button onClick={() => navigate(`/product/${product._id}`)}>
            <FullscreenIcon />
          </button>
        </div>

        <img src={product.imgs?.[0]} alt={product.name} />
      </div>

      <p>{product.name}</p>
      <Rating value={product.rating} size="small" readOnly />
      <div className="price">
        <span>${Number(product.price).toFixed(2)}</span>
        {product.old && (
          <span className="old">${Number(product.old).toFixed(2)}</span>
        )}
      </div>
    </div>
  );
}

/* =========================
   MAIN COMPONENT
========================= */
export default function ProductItem({ product }) {
  const [liked, setLiked] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [bestIndex, setBestIndex] = useState(0);
  const [freshIndex, setFreshIndex] = useState(0);

  /* ======================
     FETCH FROM BACKEND
  ====================== */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get("http://localhost:8081/api/products");
        setProducts(data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchProducts();
  }, []);

  /* ======================
     LISTING MODE
  ====================== */
  if (product) {
    return <ListingCard product={product} />;
  }

  /* ======================
     HOME SLIDER MODE
  ====================== */
  const bestSeller = products.filter(
    (p) => p.category === "Snacks" || p.category === "Beverages"
  );
  const freshItems = products.filter((p) => p.category === "Dairy");

  const sliceBest = bestSeller.slice(bestIndex, bestIndex + SHOW);
  const sliceFresh = freshItems.slice(freshIndex, freshIndex + SHOW);

  return (
    <>
      {/* BEST SELLER */}
      <div className="sliderWrap">
        <button
          className="arrowBtn left"
          onClick={() =>
            bestIndex - SHOW >= 0 && setBestIndex(bestIndex - SHOW)
          }
        >
          <FaAngleLeft />
        </button>

        <div className="productGrid">
          {sliceBest.map((p) => (
            <ProductCard
              key={p._id}
              p={p}
              liked={liked}
              setLiked={setLiked}
              navigate={navigate}
            />
          ))}
        </div>

        <button
          className="arrowBtn right"
          onClick={() =>
            bestIndex + SHOW < bestSeller.length &&
            setBestIndex(bestIndex + SHOW)
          }
        >
          <FaAngleRight />
        </button>
      </div>

      {/* FRESH ITEMS */}
      <div className="sliderWrap">
        <button
          className="arrowBtn left"
          onClick={() =>
            freshIndex - SHOW >= 0 && setFreshIndex(freshIndex - SHOW)
          }
        >
          <FaAngleLeft />
        </button>

        <div className="productGrid">
          {sliceFresh.map((p) => (
            <ProductCard
              key={p._id}
              p={p}
              liked={liked}
              setLiked={setLiked}
              navigate={navigate}
            />
          ))}
        </div>

        <button
          className="arrowBtn right"
          onClick={() =>
            freshIndex + SHOW < freshItems.length &&
            setFreshIndex(freshIndex + SHOW)
          }
        >
          <FaAngleRight />
        </button>
      </div>
    </>
  );
}

/* =========================
   PRODUCT CARD
========================= */
function ProductCard({ p, liked, setLiked, navigate }) {
  return (
    <div className="productCard">
      {p.discount && <span className="discount">{p.discount}</span>}

      <div className="imgTop">
        <div className="icons">
          <button onClick={() => setLiked(p._id)}>
            {liked === p._id ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </button>

          <button onClick={() => navigate(`/product/${p._id}`)}>
            <FullscreenIcon />
          </button>
        </div>

        <img src={p.imgs?.[0] || p.image} alt={p.name} />
      </div>

      <p>{p.name}</p>
      <Rating value={p.rating} size="small" readOnly />

      <div className="price">
        <span>${Number(p.price).toFixed(2)}</span>
        {p.old && (
          <span className="old">${Number(p.old).toFixed(2)}</span>
        )}
      </div>
    </div>
  );
}