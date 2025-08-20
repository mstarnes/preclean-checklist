import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import Home from './components/Home';
import ChecklistForm from './components/ChecklistForm';
import History from './components/History';
import Summary from './components/Summary';
import Cart from './components/Cart';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post('/refresh', { refreshToken });
          localStorage.setItem('accessToken', res.data.accessToken);
          localStorage.setItem('refreshToken', res.data.refreshToken);
          error.config.headers['Authorization'] = `Bearer ${res.data.accessToken}`;
          return axios(error.config);
        } catch (refreshError) {
          window.location.href = '/auth/google';
        }
      }
    }
    return Promise.reject(error);
  }
);

const App: React.FC = () => {
  return (
    <CartProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/checklist/:cabin" element={<ChecklistForm />} />
            <Route path="/history" element={<History />} />
            <Route path="/summary/:id" element={<Summary />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </Layout>
        <ToastContainer />
      </Router>
    </CartProvider>
  );
};

export default App;