
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Rating from "@mui/material/Rating";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

const SHOW = 4;

// Backend API URL
const API_URL = import.meta.env.VITE_API_URL;

// Get product image from MongoDB
const getProductImage = (product) => {
  if (!product) return "";

  const image =
    product.imgs?.[0] ||
    product.images?.[0] ||
    product.image ||
    product.img ||
    "";

  return image;
};

// Handle image loading errors
function ProductImage({ product }) {
  const [imageSrc, setImageSrc] = useState(
    getProductImage(product)
  );

  useEffect(() => {
    setImageSrc(getProductImage(product));
  }, [product]);

  return (
    <img
      src={imageSrc || "/placeholder.png"}
      alt={product.name || "Product"}
      loading="lazy"
      onError={() => {
        if (imageSrc !== "/placeholder.png") {
          setImageSrc("/placeholder.png");
        }
      }}
    />
  );
}

/* =========================
   LISTING PAGE CARD
========================= */

function ListingCard({ product }) {
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="productCard">

      {product.discount && (
        <span className="discount">
          {product.discount}
        </span>
      )}

      <div className="imgTop">

        <div className="icons">

          <button onClick={() => setLiked(!liked)}>
            {liked ? (
              <FavoriteIcon />
            ) : (
              <FavoriteBorderIcon />
            )}
          </button>

          <button
            onClick={() => navigate(`/product/${product._id}`)}
          >
            <FullscreenIcon />
          </button>

        </div>

        <ProductImage product={product} />

      </div>

      <p>{product.name}</p>

      <Rating
        value={Number(product.rating) || 0}
        size="small"
        readOnly
      />

      <div className="price">

        <span>
          ${Number(product.price).toFixed(2)}
        </span>

        {product.old && (
          <span className="old">
            ${Number(product.old).toFixed(2)}
          </span>
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
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const [bestIndex, setBestIndex] = useState(0);
  const [freshIndex, setFreshIndex] = useState(0);

  /* ======================
     FETCH PRODUCTS
  ====================== */

  useEffect(() => {

    const fetchProducts = async () => {

      try {

        if (!API_URL) {
          throw new Error("VITE_API_URL is missing.");
        }

        const { data } = await axios.get(
          `${API_URL}/products`
        );

        const productList = Array.isArray(data)
          ? data
          : data.products || [];

        setProducts(productList);

        console.log("Products loaded:", productList.length);

      } catch (err) {

        console.error(
          "Product fetching error:",
          err.response?.data || err.message
        );

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
     FILTER PRODUCTS
  ====================== */

  const bestSeller = products.filter(
    (p) =>
      p.category === "Snacks" ||
      p.category === "Beverages"
  );

  const freshItems = products.filter(
    (p) => p.category === "Dairy"
  );

  const sliceBest = bestSeller.slice(
    bestIndex,
    bestIndex + SHOW
  );

  const sliceFresh = freshItems.slice(
    freshIndex,
    freshIndex + SHOW
  );

  /* ======================
     HOME SLIDER MODE
  ====================== */

  return (
    <>

      {/* BEST SELLER */}

      <div className="sliderWrap">

        <button
          className="arrowBtn left"
          onClick={() =>
            bestIndex - SHOW >= 0 &&
            setBestIndex(bestIndex - SHOW)
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
            freshIndex - SHOW >= 0 &&
            setFreshIndex(freshIndex - SHOW)
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

function ProductCard({
  p,
  liked,
  setLiked,
  navigate
}) {

  return (

    <div className="productCard">

      {p.discount && (
        <span className="discount">
          {p.discount}
        </span>
      )}

      <div className="imgTop">

        <div className="icons">

          <button onClick={() => setLiked(p._id)}>
            {liked === p._id ? (
              <FavoriteIcon />
            ) : (
              <FavoriteBorderIcon />
            )}
          </button>

          <button
            onClick={() => navigate(`/product/${p._id}`)}
          >
            <FullscreenIcon />
          </button>

        </div>

        <ProductImage product={p} />

      </div>

      <p>{p.name}</p>

      <Rating
        value={Number(p.rating) || 0}
        size="small"
        readOnly
      />

      <div className="price">

        <span>
          ${Number(p.price).toFixed(2)}
        </span>

        {p.old && (
          <span className="old">
            ${Number(p.old).toFixed(2)}
          </span>
        )}

      </div>

    </div>

  );
}
