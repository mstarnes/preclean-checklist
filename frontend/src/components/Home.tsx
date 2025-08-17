import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FcGoogle } from 'react-icons/fc';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get('token');
    if (urlToken) {
      localStorage.setItem('token', urlToken);
      setToken(urlToken);
      window.history.replaceState({}, document.title, "/");
    }
    if (!token) {
      window.location.href = 'http://localhost:5002/auth/google';
    }
  }, [token]);

  if (!token) return <div>Loading...</div>;

  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-8">Preclean Checklist</h1>
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3].map(cabin => (
          <button
            key={cabin}
            onClick={() => navigate(`/checklist/${cabin}`)}
            className="bg-blue-500 text-white p-4 rounded-lg shadow-lg hover:bg-blue-600"
          >
            Cabin {cabin}
          </button>
        ))}
        <button
          onClick={() => navigate('/history')}
          className="bg-green-500 text-white p-4 rounded-lg shadow-lg hover:bg-green-600"
        >
          History
        </button>
      </div>
    </div>
  );
};

export default Home;