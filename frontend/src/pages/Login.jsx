import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('StockSmart@2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Unable to login with the provided credentials. Please check and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 10% 20%, var(--cream-soft) 0%, var(--cream) 90%)',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="blob blob-lg blob-peach" style={{ top: '-40px', left: '-40px' }} />
      <div className="blob blob-md blob-latte" style={{ bottom: '10%', right: '5%' }} />
      <div className="blob blob-sm blob-honey" style={{ top: '25%', right: '12%' }} />
      <div className="blob blob-md blob-blush" style={{ bottom: '-30px', left: '15%' }} />

      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-2xl)',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-xl)',
        border: '2px solid var(--border)',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, var(--espresso), var(--mocha))',
            borderRadius: 'var(--radius-lg)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '1rem',
            animation: 'wiggle 2s ease-in-out infinite'
          }}>
            <i className="bi bi-box-seam-fill" aria-hidden="true"></i>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark-roast)', marginBottom: '0.25rem' }}>
            StockSmart
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Inventory Management Platform
          </p>
        </div>

        {error && (
          <div className="info-box info-danger mb-3 animate-slide-up">
            <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '1.1rem' }}></i>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-with-icon">
              <i className="bi bi-person input-icon"></i>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <i className="bi bi-lock input-icon"></i>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full btn-lg mt-3"
            style={{ width: '100%' }}
          >
            {loading ? (
              <>
                <div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Enter Workspace</span>
                <i className="bi bi-arrow-right"></i>
              </>
            )}
          </button>
        </form>

        <div className="divider" />

        {/* Demo Credentials Section */}
        <div>
          <span className="section-label" style={{ display: 'block', marginBottom: '0.75rem', textAlign: 'center' }}>
            ✨ Fast Demo One-Click Fill
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleDemoFill('admin', 'StockSmart@2026')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('warehouse_mgr', 'StockSmart@2026')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              📦 Warehouse
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('store_associate', 'StockSmart@2026')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              🏪 Store Staff
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('auditor_sunil', 'StockSmart@2026')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              🔍 Auditor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
