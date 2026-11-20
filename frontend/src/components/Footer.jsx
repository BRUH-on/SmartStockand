import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1.5px solid var(--border)',
      background: 'var(--surface)',
      padding: '1.25rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      flexWrap: 'wrap',
      gap: '1rem',
      fontSize: '0.82rem',
      color: 'var(--text-muted)'
    }}>
      <div className="flex items-center gap-2">
        <i className="bi bi-box-seam-fill" aria-hidden="true"></i>
        <span style={{ fontWeight: 700, color: 'var(--dark-roast)' }}>StockSmart</span>
        <span>Inventory Management</span>
      </div>
    </footer>
  );
}
