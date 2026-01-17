import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (product, qty, preparation) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.fishName === product.fishName && item.preparation === preparation
      );

      if (existingItem) {
        return prevCart.map((item) =>
          item.fishName === product.fishName && item.preparation === preparation
            ? { ...item, qty: item.qty + qty }
            : item
        );
      }

      return [...prevCart, { fishName: product.fishName, qty, preparation, price: product.price }];
    });
  };

  const removeFromCart = (fishName, preparation) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.fishName === fishName && item.preparation === preparation))
    );
  };

  const updateQuantity = (fishName, preparation, qty) => {
    if (qty <= 0) {
      removeFromCart(fishName, preparation);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.fishName === fishName && item.preparation === preparation
          ? { ...item, qty }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.qty, 0);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getTotal }}
    >
      {children}
    </CartContext.Provider>
  );
};
