import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import ChecklistForm from './components/ChecklistForm';
import History from './components/History';
import Summary from './components/Summary';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/checklist/:cabin" element={<ChecklistForm />} />
          <Route path="/history" element={<History />} />
          <Route path="/summary/:id" element={<Summary />} />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
};

export default App;