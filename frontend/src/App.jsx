import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Suppliers from './pages/Suppliers';
import Analytics from './pages/Analytics';
import Users from './pages/Users';
import Login from './pages/Login';

function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="spinner-wrapper" style={{ height: '100vh', justifyContent: 'center' }}>
        <div className="spinner" />
        <p className="spinner-label">Loading your workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/': return 'Dashboard Overview';
      case '/products': return 'Product Catalog & SKUs';
      case '/inventory': return 'Stock Levels & Locations';
      case '/orders': return 'Sales & Purchase Orders';
      case '/suppliers': return 'Vendor Partnerships';
      case '/analytics': return 'Performance & Insights';
      case '/users': return 'Team Management & Roles';
      default: return 'StockSmart';
    }
  };

  return (
    <div className="app-wrapper">
      <Navbar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="main-content">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <button 
              className="topbar-menu-btn" 
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <i className="bi bi-list"></i>
            </button>
            <div className="flex flex-col">
              <span className="section-label">Inventory Platform</span>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--dark-roast)' }}>
                {getPageTitle(location.pathname)}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="quick-stat-pill" style={{ display: 'none', md: 'inline-flex' }}>
              <i className="bi bi-box-seam-fill" style={{ color: 'var(--espresso)' }}></i>
              <span>StockSmart Inventory</span>
            </div>
          </div>
        </header>

        <main className="page-body">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/users" element={<Users />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="spinner-wrapper" style={{ height: '100vh', justifyContent: 'center' }}>
        <div className="spinner" />
        <p className="spinner-label">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}
