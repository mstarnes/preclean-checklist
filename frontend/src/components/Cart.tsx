// frontend/src/components/Cart.tsx
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

const allItems = [
  'Bath Towels',
  'Hand Towels',
  'Wash Cloths',
  'Makeup Cloths',
  'Bath Mat',
  'Shampoo',
  'Conditioner',
  'Body Wash',
  'Body Lotion',
  'Bar Soap',
  'Soap Dispenser',
  'Toilet Paper',
  'Paper Cups',
  'Kleenex',
  'Bath Check Lights',
  'Water Bottles',
  'Coffee Pods',
  'Coffee Sweeteners',
  'Coffee Creamer',
  'Coffee Cups, Ceramic',
  'Coffee Cups, Paper',
  'Coffee Cup Lids',
  'Coffee Stirrers',
  'Reline Trash Cans',
  'Paper Towels',
  'Dish Soap',
  'Lock Battery (AA)',
  'Smoke Alarm Battery (AA)',
  'Motion Detector Battery (AA)',
  'Door Sensor Battery (CR2032)',
  'Living Check Lights',
];

const Cart: React.FC = () => {
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  const [view, setView] = useState<'summary' | 'full'>('summary');
  const [checked, setChecked] = useState<Record<string, boolean>>(allItems.reduce((acc, item) => ({ ...acc, [item]: false }), {}));
  console.log('Cart component mounted');

  useEffect(() => {
    const updatedChecked = allItems.reduce((acc, item) => ({
      ...acc,
      [item]: cart.some(c => c.item === item),
    }), {});
    setChecked(updatedChecked);
  }, [cart]);

  const handleCheck = async (item: string, isChecked: boolean) => {
    setChecked(prev => ({ ...prev, [item]: isChecked }));
    if (isChecked) {
      if (!cart.some(c => c.item === item)) {
        await addToCart(item, 1, null);
      }
    } else {
      const index = cart.findIndex(c => c.item === item);
      if (index !== -1) {
        await removeFromCart(index);
      }
    }
  };

  return (
    <div className="p-4">
      <button onClick={clearCart} className="float-right bg-red-500 text-white p-2 rounded">Empty Cart</button>
      <button onClick={() => setView(view === 'summary' ? 'full' : 'summary')} className="mb-4 bg-blue-500 text-white p-2 rounded">Toggle View</button>
      {view === 'summary' ? (
        <ul className="space-y-4">
          {cart.map((item, index) => (
            <li key={index} className="flex items-center space-x-2">
              <input type="checkbox" checked onChange={() => removeFromCart(index)} />
              <span>{item.item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-4">
          {allItems.map(item => (
            <li key={item} className="flex items-center space-x-2">
              <input type="checkbox" checked={checked[item]} onChange={(e) => handleCheck(item, e.target.checked)} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Cart;