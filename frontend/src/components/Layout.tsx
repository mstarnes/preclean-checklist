// frontend/src/components/Layout.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-500 text-white p-4 flex items-center">
        {!isHome && (
          <button onClick={() => navigate(-1)} className="mr-4">
            {/* @ts-ignore */}
            <FaArrowLeft className="h-6 w-6" />
          </button>
        )}
        <h1 className="text-xl font-bold">Preclean Checklist</h1>
      </nav>
      {children}
    </div>
  );
};

export default Layout;