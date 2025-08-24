// Home.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHome, FaClock, FaList, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [pendingCabins, setPendingCabins] = useState<number[]>([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const { cart } = useCart();
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

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
      window.location.href = '/auth/google';
    } else {
      axios.get('/api/pending-summaries').then(res => {
        setPendingCabins(res.data.pendings.map((p: any) => p.cabinNumber));
      });
      axios.get('/api/checklists').then(res => {
        setTotalDocs(res.data.length);
      });
    }
  }, [token]);
  
  if (!token) return <div>Loading...</div>;

  const hasPending = pendingCabins.length > 0;

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="grid grid-cols-2 gap-2 max-w-xs w-full">
        {[1, 2, 3].map(cabin => (
          <button
            key={cabin}
            onClick={() => navigate(`/checklist/${cabin}`)}
            className="bg-blue-500 text-white p-1 rounded-lg shadow-lg hover:bg-blue-600 relative flex flex-col items-center justify-center aspect-square font-bold"
          >
            {FaHome({ className: "mb-1 h-6 w-6" })}
            Cabin {cabin}
            {pendingCabins.includes(cabin) && (
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"></span>
            )}
          </button>
        ))}
        <button
          onClick={() => navigate('/summary/global')}
          className={`bg-purple-500 text-white p-1 rounded-lg shadow-lg hover:bg-purple-600 relative flex flex-col items-center justify-center aspect-square font-bold ${hasPending ? '' : 'hidden'}`}
        >
          {FaList({ className: "mb-1 h-6 w-6" })}
          Summary
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{pendingCabins.length}</span>
        </button>
        <button
          onClick={() => navigate('/history')}
          className="bg-green-500 text-white p-1 rounded-lg shadow-lg hover:bg-green-600 relative flex flex-col items-center justify-center aspect-square font-bold"
        >
          {FaClock({ className: "mb-1 h-6 w-6" })}
          History
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{totalDocs}</span>
        </button>
        <button
          onClick={() => navigate('/cart')}
          className="bg-yellow-500 text-white p-1 rounded-lg shadow-lg hover:bg-yellow-600 relative flex flex-col items-center justify-center aspect-square font-bold"
        >
          {FaShoppingCart({ className: "mb-1 h-6 w-6" })}
          Cart
          {cartItemsCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{cartItemsCount}</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Home;