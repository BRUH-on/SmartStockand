import React, { useState, useEffect } from 'react';
import api from '../api/client';
import Badge from '../components/Badge';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    role: 'STORE_ASSOCIATE'
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/');
      setUsers(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles/');
      setRoles(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      console.error('Failed to load roles', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/register/', formData);
      setShowModal(false);
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        role: 'STORE_ASSOCIATE'
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create user account.');
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Team & Role Access Control</h1>
          <p className="text-muted text-sm">
            Authorize team members, warehouse managers and store clerks
          </p>
        </div>
        <div className="page-header-right">
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <i className="bi bi-person-plus-fill"></i> Add Team Member
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '1.2rem' }}>👥</span>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
              Store Staff & Personnel ({users.length})
            </h3>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="spinner-wrapper">
              <div className="spinner" />
              <p className="spinner-label">Loading team rosters...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon"><i className="bi bi-people"></i></span>
              <div className="empty-title">No team members found</div>
              <p className="empty-subtitle">Create a user profile to invite staff members.</p>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Assigned Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            {(u.first_name || u.username || 'SS').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--dark-roast)' }}>
                              {u.first_name ? `${u.first_name} ${u.last_name || ''}` : u.username}
                            </div>
                            <span className="text-muted text-sm">User ID: #{u.id}</span>
                          </div>
                        </div>
                      </td>
                      <td><span className="mono">@{u.username}</span></td>
                      <td>{u.email || 'N/A'}</td>
                      <td>
                        <span className="badge badge-mocha">
                          {u.role || (u.is_superuser ? 'ADMIN' : 'ASSOCIATE')}
                        </span>
                      </td>
                      <td>
                        <Badge variant="success">Active</Badge>
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
              <h4 className="modal-title">✨ Add Team Member</h4>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Account Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role Assignment</label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="ADMIN">System Administrator</option>
                    <option value="WAREHOUSE_MANAGER">Warehouse Manager</option>
                    <option value="STORE_ASSOCIATE">Store Associate</option>
                    <option value="AUDITOR">Inventory Auditor</option>
                  </select>
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
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
