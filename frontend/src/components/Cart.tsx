// frontend/src/components/Cart.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  const { cart, setCart, removeFromCart } = useCart();
  const [view, setView] = useState<'summary' | 'full'>('summary');
  const [checked, setChecked] = useState<Record<string, boolean>>(allItems.reduce((acc, item) => ({ ...acc, [item]: false }), {}));

  useEffect(() => {
    axios.get('/api/cart').then(res => setCart(res.data));
  }, [setCart]);

  const handleCheck = (item: string, isChecked: boolean) => {
    setChecked(prev => ({ ...prev, [item]: isChecked }));
    if (isChecked) {
      axios.post('/api/cart', { item, quantity: 1, cabin: null }).then(res => setCart(res.data));
    } else {
      const index = cart.findIndex(c => c.item === item);
      if (index !== -1) {
        axios.delete('/api/cart/' + index).then(res => setCart(res.data));
      }
    }
  };

  return (
    <div className="p-4">
      <button onClick={() => setView(view === 'summary' ? 'full' : 'summary')} className="mb-4 bg-blue-500 text-white p-2 rounded">Toggle View</button>
      {view === 'summary' ? (
        <ul className="space-y-4">
          {cart.map((item, index) => (
            <li key={index} className="flex items-center space-x-2">
              <input type="checkbox" checked onChange={() => removeFromCart(index)} />
              <span>{item.item} - {item.quantity}</span>
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