import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import { useState } from "react";

const ProductModal = ({ open, handleClose, product }) => {
  const [qty,       setQty]       = useState(1);
  const [activeImg, setActiveImg] = useState(product?.img);

  if (!product) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogContent className="pm-dialog-content">

        {/* ── LEFT: IMAGE SECTION ── */}
        <div className="pm-image-section">
          <img src={activeImg} className="pm-main-image" alt={product.name} />
          <div className="pm-thumb-row">
            {[product.img, product.img, product.img].map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setActiveImg(img)}
                className={`pm-thumb ${activeImg === img ? "pm-thumb-active" : ""}`}
                alt=""
              />
            ))}
          </div>
        </div>

        {/* ── RIGHT: INFO SECTION ── */}
        <div className="pm-info-section">
          <h2 className="pm-product-name">{product.name}</h2>
          <Rating value={product.rating} readOnly />

          <h3 className="pm-price">
            {product.price}
            <span className="pm-old-price">{product.old}</span>
          </h3>

          <span className="pm-stock-badge">IN STOCK</span>

          <p className="pm-description">
            Fresh organic grocery product delivered instantly at your doorstep.
          </p>

          {/* Quantity */}
          <div className="pm-qty-row">
            <button className="pm-qty-btn" onClick={() => qty > 1 && setQty(qty - 1)}>−</button>
            <strong className="pm-qty-value">{qty}</strong>
            <button className="pm-qty-btn" onClick={() => setQty(qty + 1)}>+</button>
          </div>

          {/* Add to Cart */}
          <Button variant="contained" className="pm-add-cart-btn">
            Add to Cart
          </Button>
        </div>

        {/* ── CLOSE BUTTON ── */}
        <IconButton onClick={handleClose} className="pm-close-btn">
          <CloseIcon />
        </IconButton>

      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;