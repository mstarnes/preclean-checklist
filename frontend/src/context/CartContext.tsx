// frontend/src/context/CartContext.tsx
import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import axios from 'axios';

interface CartItem {
  item: string;
  quantity: number;
  cabin: number | null;
}

interface CartContextType {
  cart: CartItem[];
  setCart: Dispatch<SetStateAction<CartItem[]>>;
  addToCart: (item: string, quantity: number, cabin: number | null) => Promise<void>;
  removeFromCart: (index: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get('/api/cart');
        setCart(res.data);
      } catch (err) {
        console.error('Failed to fetch cart:', err);
      }
    };
    fetchCart();
  }, []);

  const addToCart = async (item: string, quantity: number, cabin: number | null) => {
    try {
      const res = await axios.post('/api/cart', { item, quantity, cabin });
      setCart(res.data);
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const removeFromCart = async (index: number) => {
    try {
      const res = await axios.delete(`/api/cart/${index}`);
      setCart(res.data);
    } catch (err) {
      console.error('Error removing from cart:', err);
    }
  };

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, removeFromCart }}>
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