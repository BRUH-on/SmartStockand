import React, { useState, useEffect } from 'react';
import api from '../api/client';
import Badge from '../components/Badge';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/suppliers/');
      setSuppliers(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      console.error('Failed to load suppliers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (sup = null) => {
    if (sup) {
      setEditingSupplier(sup);
      setFormData({
        name: sup.name,
        contact_name: sup.contact_name || '',
        email: sup.email || '',
        phone: sup.phone || '',
        address: sup.address || ''
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: '',
        contact_name: '',
        email: '',
        phone: '',
        address: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier.id}/`, formData);
      } else {
        await api.post('/suppliers/', formData);
      }
      setShowModal(false);
      fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save supplier.');
    }
  };

  const filteredSuppliers = suppliers.filter((s) => {
    return (
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="animate-slide-up responsive-data-page supplier-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Supplier & Vendor Partners</h1>
          <p className="text-muted text-sm">
            Manage supplier contact details and delivery partners.
          </p>
        </div>
        <div className="page-header-right">
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            <i className="bi bi-plus-circle-fill"></i> Add Supplier
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="card mb-4">
        <div className="card-body" style={{ padding: '1rem 1.25rem' }}>
          <div className="search-bar" style={{ maxWidth: '400px' }}>
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search vendor name, email or contact..."
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

      {/* Suppliers Table */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '1.2rem' }}>🚚</span>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
              Registered Vendors ({filteredSuppliers.length})
            </h3>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="spinner-wrapper">
              <div className="spinner" />
              <p className="spinner-label">Loading supplier records...</p>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon"><i className="bi bi-truck"></i></span>
              <div className="empty-title">No suppliers found</div>
              <p className="empty-subtitle">
                Add suppliers to track purchasing and restocks.
              </p>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table responsive-data-table">
                <thead>
                  <tr>
                    <th>Vendor / Business Name</th>
                    <th>Representative</th>
                    <th>Contact Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((s) => (
                    <tr key={s.id}>
                      <td data-label="Vendor / Business Name">
                        <div style={{ fontWeight: 700, color: 'var(--dark-roast)' }}>{s.name}</div>
                        <span className="text-muted text-sm">{s.address || 'Address not provided'}</span>
                      </td>
                      <td data-label="Representative">
                        <span style={{ fontWeight: 600 }}>{s.contact_name || 'Contact not provided'}</span>
                      </td>
                      <td data-label="Contact Email">
                        <a href={`mailto:${s.email}`} style={{ color: 'var(--espresso)', textDecoration: 'none' }}>
                          {s.email || 'N/A'}
                        </a>
                      </td>
                      <td data-label="Phone">{s.phone || 'N/A'}</td>
                      <td data-label="Status">
                        <Badge variant="success">Active</Badge>
                      </td>
                      <td data-label="Actions" style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenModal(s)}
                          className="btn btn-secondary btn-sm"
                        >
                          <i className="bi bi-pencil-fill"></i> Edit
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4 className="modal-title">
                {editingSupplier ? 'Edit Vendor Details' : '✨ New Supplier Account'}
              </h4>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Vendor Company Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Person</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  />
                </div>

                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Warehouse Address</label>
                  <textarea
                    rows={2}
                    className="form-control"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSupplier ? 'Update Vendor' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
