import { useParams } from "react-router-dom";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";

const products = [
  {
    images: [
      "https://m.media-amazon.com/images/I/814OlSoF3CL._SX679_.jpg",
      "https://m.media-amazon.com/images/I/71SzPumnxJL._SX679_.jpg",
      "https://m.media-amazon.com/images/I/816SNZtqvVL._SX679_.jpg"
    ],
    name: "All Natural Italian-Style Chicken Meatballs",
    price: "$7.25",
    old: "$9.95",
    rating: 4
  },
  {
    images: [
      "https://m.media-amazon.com/images/I/41VxPV-rWsL._SY300_SX300_QL70_ML2_.jpg"
    ],
    name: "Angie's Boomchickapop Sweet & Salty Kettle Corn",
    price: "$3.29",
    old: "$4.29",
    rating: 4.5
  }
];

const ProductDetails = () => {
  const { id } = useParams();
  const product = products[id];

  if (!product) return <h2>Product not found</h2>;

  return (
    <div style={{ display: "flex", gap: 60, padding: 40 }}>
      
      <div>
        <img 
          src={product.images[0]} 
          style={{ width: 400 }} 
          alt=""
        />
      </div>

      <div>
        <h1>{product.name}</h1>

        <Rating value={product.rating} readOnly />

        <h2 style={{ color: "#2e7d32" }}>
          {product.price}
          <span style={{
            marginLeft: 10,
            textDecoration: "line-through",
            color: "#999"
          }}>
            {product.old}
          </span>
        </h2>

        <Button variant="contained" size="large">
          Add to Cart
        </Button>
      </div>

    </div>
  );
};

export default ProductDetails;
