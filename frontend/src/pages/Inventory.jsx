import React, { useState, useEffect } from 'react';
import api from '../api/client';
import Badge from '../components/Badge';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('ALL');

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustmentQty, setAdjustmentQty] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('AUDIT_CORRECTION');

  useEffect(() => {
    fetchInventory();
    fetchLocations();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory-items/');
      setItems(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await api.get('/locations/');
      setLocations(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      console.error('Failed to load locations', err);
    }
  };

  const handleOpenAdjust = (item) => {
    setSelectedItem(item);
    setAdjustmentQty('');
    setAdjustmentReason('AUDIT_CORRECTION');
    setShowAdjustModal(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/adjustments/', {
        inventory_item: selectedItem.id,
        quantity_change: parseInt(adjustmentQty, 10),
        reason: adjustmentReason
      });
      setShowAdjustModal(false);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit adjustment.');
    }
  };

  const filteredItems = items.filter((item) => {
    const prodName = item.product?.name || item.product_name || '';
    const prodSku = item.product?.sku || item.sku || '';
    const matchesSearch =
      prodName.toLowerCase().includes(search.toLowerCase()) ||
      prodSku.toLowerCase().includes(search.toLowerCase());

    const locId = item.location?.id || item.location;
    const matchesLoc =
      locationFilter === 'ALL' || String(locId) === String(locationFilter);

    return matchesSearch && matchesLoc;
  });

  const getStatusBadge = (quantity, reorderPoint = 10) => {
    if (quantity <= 0) {
      return <Badge variant="danger">Out of Stock</Badge>;
    }
    if (quantity <= reorderPoint) {
      return <Badge variant="warning">Low Stock</Badge>;
    }
    return <Badge variant="success">In Stock</Badge>;
  };

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Stock Levels & Locations</h1>
          <p className="text-muted text-sm">
            Real-time multi-location quantities, warehouse bins & safety buffers
          </p>
        </div>
        <div className="page-header-right">
          <button onClick={fetchInventory} className="btn btn-secondary">
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="card mb-4">
        <div className="card-body" style={{ padding: '1rem 1.25rem' }}>
          <div className="filter-bar" style={{ margin: 0 }}>
            <div className="search-bar" style={{ flex: 1 }}>
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Search stock item or SKU..."
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

            <div style={{ minWidth: '180px' }}>
              <select
                className="form-select"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="ALL">All Store Locations</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '1.2rem' }}>📦</span>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
              Location Inventory Records ({filteredItems.length})
            </h3>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="spinner-wrapper">
              <div className="spinner" />
              <p className="spinner-label">Checking storage bins...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon"><i className="bi bi-boxes"></i></span>
              <div className="empty-title">No stock rows found</div>
              <p className="empty-subtitle">
                Clear filters or initialize stock from your product catalog.
              </p>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product / SKU</th>
                    <th>Warehouse / Store Location</th>
                    <th>Quantity On Hand</th>
                    <th>Safety Reorder Point</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const prod = item.product || {};
                    const loc = item.location || {};
                    return (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--dark-roast)' }}>
                            {prod.name || item.product_name}
                          </div>
                          <span className="mono">{prod.sku || item.sku || 'N/A'}</span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <i className="bi bi-geo-alt-fill" style={{ color: 'var(--mocha)' }}></i>
                            <span>{loc.name || item.location_name || 'Primary Store'}</span>
                          </div>
                        </td>
                        <td>
                          <span className="num-highlight" style={{ fontSize: '1.1rem' }}>
                            {item.quantity} units
                          </span>
                        </td>
                        <td>
                          <span className="text-muted">{item.reorder_point || 10} min</span>
                        </td>
                        <td>{getStatusBadge(item.quantity, item.reorder_point)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleOpenAdjust(item)}
                            className="btn btn-secondary btn-sm"
                            title="Adjust Stock"
                          >
                            <i className="bi bi-sliders"></i> Adjust
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {showAdjustModal && (
        <div className="modal-overlay" onClick={() => setShowAdjustModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4 className="modal-title">Adjust Stock Level</h4>
              <button className="close-btn" onClick={() => setShowAdjustModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleAdjustSubmit}>
              <div className="modal-body">
                <div style={{
                  background: 'var(--cream-soft)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{ fontWeight: 800, color: 'var(--dark-roast)' }}>
                    {selectedItem?.product?.name || selectedItem?.product_name}
                  </div>
                  <div className="text-sm text-muted">
                    Current Balance: <strong>{selectedItem?.quantity}</strong> units
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity Change (+ / -)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. +10 or -5"
                    value={adjustmentQty}
                    onChange={(e) => setAdjustmentQty(e.target.value)}
                    required
                  />
                  <small className="text-muted text-sm">
                    Enter positive value to add items, negative to write-off.
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">Adjustment Reason</label>
                  <select
                    className="form-select"
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                  >
                    <option value="AUDIT_CORRECTION">Audit Correction</option>
                    <option value="DAMAGE_SPOILAGE">Damage / Spoilage</option>
                    <option value="RECEIPT_DISCREPANCY">Shipment Discrepancy</option>
                    <option value="RESTOCK">Supplier Restock</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAdjustModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Commit Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
