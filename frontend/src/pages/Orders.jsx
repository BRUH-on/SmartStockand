import React, { useState, useEffect } from 'react';
import api from '../api/client';
import Badge from '../components/Badge';

export default function Orders() {
  const [activeTab, setActiveTab] = useState('sales'); // 'sales' | 'purchase'
  const [salesOrders, setSalesOrders] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      if (activeTab === 'sales') {
        const res = await api.get('/orders/');
        setSalesOrders(Array.isArray(res.data) ? res.data : (res.data.results || []));
      } else {
        const res = await api.get('/purchase-orders/');
        setPurchaseOrders(Array.isArray(res.data) ? res.data : (res.data.results || []));
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'received':
      case 'delivered':
        return <Badge variant="success">{status}</Badge>;
      case 'pending':
      case 'draft':
        return <Badge variant="warning">{status}</Badge>;
      case 'cancelled':
        return <Badge variant="danger">{status}</Badge>;
      case 'processing':
      case 'ordered':
      default:
        return <Badge variant="info">{status || 'Active'}</Badge>;
    }
  };

  const currentList = activeTab === 'sales' ? salesOrders : purchaseOrders;
  const filteredList = currentList.filter((o) => {
    const idStr = String(o.order_number || o.po_number || o.id || '');
    const clientStr = String(o.customer_name || o.supplier_name || '');
    return (
      idStr.toLowerCase().includes(search.toLowerCase()) ||
      clientStr.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Order Management</h1>
          <p className="text-muted text-sm">
            Track customer sales transactions and supplier purchase orders
          </p>
        </div>
        <div className="page-header-right">
          <button onClick={fetchOrders} className="btn btn-secondary">
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="pill-row mb-4">
        <button
          onClick={() => setActiveTab('sales')}
          className={`btn ${activeTab === 'sales' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <i className="bi bi-receipt"></i> Customer Sales Orders
        </button>
        <button
          onClick={() => setActiveTab('purchase')}
          className={`btn ${activeTab === 'purchase' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <i className="bi bi-bag-check"></i> Supplier Purchase Orders
        </button>
      </div>

      {/* Search Bar */}
      <div className="card mb-4">
        <div className="card-body" style={{ padding: '1rem 1.25rem' }}>
          <div className="search-bar" style={{ maxWidth: '400px' }}>
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder={`Search ${activeTab === 'sales' ? 'sales order / customer...' : 'PO number / supplier...'}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '1.2rem' }}>
              {activeTab === 'sales' ? '🧾' : '📦'}
            </span>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
              {activeTab === 'sales' ? 'Recent Sales Receipts' : 'Supply Procurement Logs'} ({filteredList.length})
            </h3>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="spinner-wrapper">
              <div className="spinner" />
              <p className="spinner-label">Fetching transaction records...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon"><i className="bi bi-receipt"></i></span>
              <div className="empty-title">No orders found</div>
              <p className="empty-subtitle">
                No active {activeTab === 'sales' ? 'customer orders' : 'purchase orders'} match your search.
              </p>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{activeTab === 'sales' ? 'Order Number' : 'PO Number'}</th>
                    <th>{activeTab === 'sales' ? 'Customer' : 'Supplier'}</th>
                    <th>Date Placed</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((ord) => (
                    <tr key={ord.id}>
                      <td>
                        <strong className="mono">
                          {ord.order_number || ord.po_number || `#ORD-${ord.id}`}
                        </strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--dark-roast)' }}>
                          {ord.customer_name || ord.supplier_name || 'Retail Client'}
                        </div>
                      </td>
                      <td>
                        <span className="text-muted text-sm">
                          {ord.order_date || ord.created_at
                            ? new Date(ord.order_date || ord.created_at).toLocaleDateString()
                            : '—'}
                        </span>
                      </td>
                      <td>
                        <span className="num-highlight">
                          ₹{Number(ord.total_amount || ord.total_cost || 0).toFixed(2)}
                        </span>
                      </td>
                      <td>{getOrderStatusBadge(ord.status)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => alert(`Order details for #${ord.order_number || ord.id}`)}
                        >
                          <i className="bi bi-eye"></i> Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
