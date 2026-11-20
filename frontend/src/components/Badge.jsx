import React from 'react';

export default function Badge({ variant = 'mocha', children, dot = true, className = '' }) {
  const getBadgeClass = (v) => {
    switch (v) {
      case 'success':
      case 'completed':
      case 'in_stock':
      case 'active':
        return 'badge-success';
      case 'warning':
      case 'low_stock':
      case 'pending':
        return 'badge-warning';
      case 'danger':
      case 'out_of_stock':
      case 'cancelled':
        return 'badge-danger';
      case 'info':
      case 'processing':
        return 'badge-info';
      case 'lilac':
        return 'badge-lilac';
      case 'mocha':
      default:
        return 'badge-mocha';
    }
  };

  return (
    <span className={`badge ${getBadgeClass(variant)} ${className}`}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
}
