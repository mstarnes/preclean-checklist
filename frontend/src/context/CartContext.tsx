// frontend/src/context/CartContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CartItem {
  item: string;
  quantity: number;
  cabin: number | null;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: string, quantity: number, cabin: number | null) => void;
  removeFromCart: (index: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: string, quantity: number, cabin: number | null) => {
    setCart(prev => [...prev, { item, quantity, cabin }]);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};