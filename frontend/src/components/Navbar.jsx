import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ mobileOpen, setMobileOpen }) {
  const { user, logout, isAdmin } = useAuth();

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: 'bi-grid-fill', badge: null },
    { to: '/products', label: 'Products', icon: 'bi-box-seam-fill', badge: null },
    { to: '/inventory', label: 'Inventory', icon: 'bi-layers-fill', badge: null },
    { to: '/orders', label: 'Orders', icon: 'bi-receipt-cutoff', badge: null },
    { to: '/suppliers', label: 'Suppliers', icon: 'bi-truck', badge: null },
    { to: '/analytics', label: 'Analytics', icon: 'bi-bar-chart-fill', badge: null },
    ...(isAdmin ? [{ to: '/users', label: 'Team & Roles', icon: 'bi-people-fill', badge: 'Admin' }] : [])
  ];

  const getInitials = (name) => {
    if (!name) return 'SS';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <div 
        className={`mobile-overlay ${mobileOpen ? 'active' : ''}`} 
        onClick={() => setMobileOpen(false)} 
      />
      
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <i className="bi bi-box-seam-fill" aria-hidden="true"></i>
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">StockSmart</span>
            <span className="sidebar-logo-sub">Inventory Management</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main Menu</div>
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="nav-icon">
                <i className={`bi ${item.icon}`}></i>
              </div>
              <span className="nav-label flex-1">{item.label}</span>
              {item.badge && (
                <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}

          <div className="sidebar-section-label mt-3">Inventory Overview</div>
          <div style={{ padding: '0.5rem 0.75rem' }}>
            <div style={{ 
              background: 'var(--cream-deep)', 
              borderRadius: 'var(--radius-lg)', 
              padding: '0.85rem',
              border: '1px dashed var(--caramel-mid)'
            }}>
              <div className="flex items-center gap-2 mb-1">
                <i className="bi bi-boxes" style={{ fontSize: '1.1rem' }}></i>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--dark-roast)' }}>Store Inventory</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                Track stock across all store locations.
              </p>
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-pill mb-2">
            <div className="user-avatar">
              {getInitials(user?.first_name || user?.username)}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username || 'Stock Manager'}</div>
              <div className="user-role">{user?.role || 'Retail Associate'}</div>
            </div>
          </div>

          <button 
            onClick={logout} 
            className="btn btn-secondary w-full"
            style={{ fontSize: '0.8rem', padding: '0.45rem' }}
          >
            <i className="bi bi-box-arrow-right"></i> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
