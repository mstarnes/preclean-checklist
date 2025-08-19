import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  const getComponentName = () => {
    if (location.pathname === '/') return '';
    if (location.pathname.startsWith('/checklist/')) return 'Cabin ' + location.pathname.split('/').pop();
    if (location.pathname === '/history') return 'History';
    if (location.pathname.startsWith('/summary')) return 'Summary';
    if (location.pathname === '/cart') return 'Cart';
    return '';
  };

  const title = `Preclean Checklist${getComponentName() ? ' : ' + getComponentName() : ''}`;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-500 text-white p-4 flex items-center fixed top-0 w-full z-10">
        {!isHome && (
          <button onClick={() => navigate(-1)} className="mr-4">
            {FaArrowLeft({ className: "h-6 w-6" })}
          </button>
        )}
        <h1 className="text-xl font-bold">{title}</h1>
      </nav>
      <main className="pt-16">{children}</main> 
    </div>
  );
};

export default Layout;