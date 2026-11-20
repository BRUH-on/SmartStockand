import React, { useState, useEffect } from 'react';
import api from '../api/client';
import Badge from '../components/Badge';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    selling_price: '',
    cost_price: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/');
      setProducts(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/');
      setCategories(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const handleOpenModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setFormData({
        name: prod.name,
        sku: prod.sku,
        category: prod.category?.id || prod.category || '',
        selling_price: prod.selling_price,
        cost_price: prod.cost_price,
        description: prod.description || '',
        is_active: prod.is_active !== undefined ? prod.is_active : true
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        sku: '',
        category: categories[0]?.id || '',
        selling_price: '',
        cost_price: '',
        description: '',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}/`, formData);
      } else {
        await api.post('/products/', formData);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save product details.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}/`);
        fetchProducts();
      } catch (err) {
        alert('Could not delete product.');
      }
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      selectedCat === 'ALL' ||
      String(p.category?.id || p.category) === String(selectedCat);
    return matchesSearch && matchesCat;
  });

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Product Catalog</h1>
          <p className="text-muted text-sm">
            Manage product details, pricing, and catalog categories.
          </p>
        </div>
        <div className="page-header-right">
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            <i className="bi bi-plus-circle-fill"></i> Add New Product
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
                placeholder="Search by name or SKU..."
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
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '1.2rem' }}>📦</span>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
              Registered SKUs ({filteredProducts.length})
            </h3>
          </div>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="spinner-wrapper">
              <div className="spinner" />
              <p className="spinner-label">Fetching items...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon"><i className="bi bi-box-seam"></i></span>
              <div className="empty-title">No products found</div>
              <p className="empty-subtitle">
                Try searching with another keyword or add a new SKU.
              </p>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product & SKU</th>
                    <th>Category</th>
                    <th>Cost Price</th>
                    <th>Retail Price</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--dark-roast)' }}>{p.name}</div>
                        <span className="mono">{p.sku}</span>
                      </td>
                      <td>
                        <span className="badge badge-mocha">
                          {p.category_name || (typeof p.category === 'object' ? p.category?.name : 'Uncategorized')}
                        </span>
                      </td>
                      <td>₹{Number(p.cost_price || 0).toFixed(2)}</td>
                      <td>
                        <strong style={{ color: 'var(--dark-roast)' }}>
                          ₹{Number(p.selling_price || 0).toFixed(2)}
                        </strong>
                      </td>
                      <td>
                        <Badge variant={p.is_active ? 'success' : 'danger'}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenModal(p)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Product"
                          >
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--rose)', borderColor: 'var(--rose)' }}
                            title="Delete Product"
                          >
                            <i className="bi bi-trash-fill"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Add / Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4 className="modal-title">
                {editingProduct ? 'Edit Product' : '✨ New Product Entry'}
              </h4>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">SKU Code</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Cost Price (INR)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={formData.cost_price}
                      onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Retail Price (INR)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={formData.selling_price}
                      onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={2}
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  {editingProduct ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
