// frontend/src/components/Home.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHome, FaClock, FaList, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [pendingCabins, setPendingCabins] = useState<number[]>([]);
  const { cart } = useCart();
  const cartItemsCount = cart.length;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');
    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setToken(accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      window.history.replaceState({}, document.title, "/");
    }
    if (!token) {
      window.location.href = 'http://localhost:5002/auth/google';
    } else {
      axios.get('/api/pending-summaries').then(res => {
        setPendingCabins(res.data.pendings.map((p: any) => p.cabinNumber));
      });
    }
  }, [token]);

  if (!token) return <div>Loading...</div>;

  const hasPending = pendingCabins.length > 0;

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-8">Preclean Checklist</h1>
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3].map(cabin => (
          <button
            key={cabin}
            onClick={() => navigate(`/checklist/${cabin}`)}
            className="bg-blue-500 text-white p-4 rounded-lg shadow-lg hover:bg-blue-600 relative"
          >
            {/* @ts-ignore */}
            <FaHome className="mx-auto mb-2 h-8 w-8" />
            Cabin {cabin}
            {pendingCabins.includes(cabin) && (
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-1 text-xs">1</span>
            )}
          </button>
        ))}
        <button
          onClick={() => navigate('/history')}
          className="bg-green-500 text-white p-4 rounded-lg shadow-lg hover:bg-green-600"
        >
          {/* @ts-ignore */}
          <FaClock className="mx-auto mb-2 h-8 w-8" />
          History
        </button>
      </div>
      {hasPending && (
        <button onClick={() => navigate('/summary/global')} className="mt-4 bg-purple-500 text-white p-4 rounded-lg shadow-lg hover:bg-purple-600 relative">
          {/* @ts-ignore */}
          <FaList className="mx-auto mb-2 h-8 w-8" />
          Summary
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-1 text-xs">{pendingCabins.length}</span>
        </button>
      )}
      <button onClick={() => navigate('/cart')} className="mt-4 bg-yellow-500 text-white p-4 rounded-lg shadow-lg hover:bg-yellow-600 relative">
        {/* @ts-ignore */}
        <FaShoppingCart className="mx-auto mb-2 h-8 w-8" />
        Cart
        {cartItemsCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-1 text-xs">{cartItemsCount}</span>
        )}
      </button>
    </div>
  );
};

export default Home;