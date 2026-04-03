import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import { useState } from "react";

const ProductModal = ({ open, handleClose, product }) => {
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(product?.img);

  if (!product) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogContent sx={{ display: "flex", gap: 4 }}>

        {/* LEFT IMAGE SECTION */}
        <div style={{ flex: 1 }}>
          <img
            src={activeImg}
            style={{ width: "100%", borderRadius: 10 }}
            alt=""
          />

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            {[product.img, product.img, product.img].map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setActiveImg(img)}
                style={{
                  width: 70,
                  borderRadius: 6,
                  cursor: "pointer",
                  border: activeImg === img ? "2px solid #2e7d32" : "1px solid #ddd"
                }}
              />
            ))}
          </div>
        </div>

        {/* RIGHT INFO SECTION */}
        <div style={{ flex: 1 }}>

          <h2>{product.name}</h2>

          <Rating value={product.rating} readOnly />

          <h3 style={{ color: "#d32f2f" }}>
            {product.price}
            <span style={{
              marginLeft: 10,
              textDecoration: "line-through",
              color: "#999",
              fontSize: 16
            }}>
              {product.old}
            </span>
          </h3>

          <span style={{
            background: "#e8f5e9",
            padding: "4px 10px",
            borderRadius: 20,
            fontSize: 12
          }}>
            IN STOCK
          </span>

          <p style={{ marginTop: 15, color: "#666" }}>
            Fresh organic grocery product delivered instantly at your doorstep.
          </p>

          {/* QUANTITY */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 15
          }}>
            <button onClick={() => qty > 1 && setQty(qty - 1)}>−</button>
            <strong>{qty}</strong>
            <button onClick={() => setQty(qty + 1)}>+</button>
          </div>

          {/* ADD CART */}
          <Button
            variant="contained"
            sx={{ mt: 3, background: "#2e7d32", padding: "10px 30px" }}
          >
            Add to Cart
          </Button>

        </div>

        {/* CLOSE */}
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", right: 10, top: 10 }}
        >
          <CloseIcon />
        </IconButton>

      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
