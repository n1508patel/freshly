import { createContext, useContext, useEffect, useState } from "react";

export const CartContext = createContext();

function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // ADD TO CART
  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // UPDATE QTY
  const updateQty = (_id, qty) => {
    if (qty <= 0) {
      removeFromCart(_id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === _id ? { ...item, quantity: qty } : item
      )
    );
  };

  // INCREASE
  const increaseQty = (_id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === _id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // DECREASE
  const decreaseQty = (_id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === _id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  // REMOVE
  const removeFromCart = (_id) => {
    setCartItems((prev) => prev.filter((item) => item._id !== _id));
  };

  // CLEAR CART
  const clearCart = () => setCartItems([]);

  // COMPUTED VALUES
  const cart = cartItems;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  // qty alias for CartDrawer compatibility
  const cartItemsWithQty = cartItems.map((item) => ({
    ...item,
    qty: item.quantity,
  }));

  return (
    <CartContext.Provider
      value={{
        cartItems: cartItemsWithQty,
        cart: cartItemsWithQty,
        addToCart,
        increaseQty,
        decreaseQty,
        updateQty,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
export default CartProvider;