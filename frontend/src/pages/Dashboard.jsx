import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  normalizeAnalyticsKpis,
  normalizeCategoryBreakdown,
  normalizeReorderRecommendations,
  normalizeSalesTrend
} from '../api/analytics';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import dashboardIllustration from '../assets/dashboard-illustration.svg';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    total_products: 0,
    total_stock_units: 0,
    total_inventory_value: 0,
    low_stock_items: 0,
    out_of_stock_items: 0,
    pending_orders: 0
  });
  const [salesTrend, setSalesTrend] = useState({ dates: [], totals: [] });
  const [categoryBreakdown, setCategoryBreakdown] = useState({ categories: [], counts: [] });
  const [reorders, setReorders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [kpiRes, salesRes, catRes, reorderRes] = await Promise.allSettled([
        api.get('/analytics/kpis/'),
        api.get('/analytics/sales-trend/'),
        api.get('/analytics/category-breakdown/'),
        api.get('/analytics/reorder-recommendations/')
      ]);

      if (kpiRes.status === 'fulfilled') {
        setKpis(normalizeAnalyticsKpis(kpiRes.value.data));
      } else {
        console.error('Failed to load dashboard KPIs:', kpiRes.reason);
      }
      if (salesRes.status === 'fulfilled') {
        setSalesTrend(normalizeSalesTrend(salesRes.value.data));
      } else {
        console.error('Failed to load dashboard sales trend:', salesRes.reason);
      }
      if (catRes.status === 'fulfilled') {
        setCategoryBreakdown(normalizeCategoryBreakdown(catRes.value.data));
      } else {
        console.error('Failed to load dashboard category breakdown:', catRes.reason);
      }
      if (reorderRes.status === 'fulfilled') {
        setReorders(normalizeReorderRecommendations(reorderRes.value.data).slice(0, 5));
      } else {
        console.error('Failed to load dashboard reorder recommendations:', reorderRes.reason);
      }

      if ([kpiRes, salesRes, catRes, reorderRes].some((result) => result.status === 'rejected')) {
        setError('Some dashboard data could not be loaded. Refresh to try again.');
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError('Dashboard data could not be loaded. Refresh to try again.');
    } finally {
      setLoading(false);
    }
  };

  const lineChartData = {
    labels: salesTrend.dates || [],
    datasets: [
      {
        label: 'Sales Revenue (INR)',
        data: salesTrend.totals || [],
        borderColor: '#8B5E3C',
        backgroundColor: 'rgba(196, 127, 90, 0.15)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#8B5E3C',
        pointBorderColor: '#FFF',
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#3D2B1F',
        titleFont: { family: 'Nunito', weight: 'bold' },
        bodyFont: { family: 'Nunito' },
        cornerRadius: 8,
        padding: 10
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#A07858', font: { family: 'Nunito' } }
      },
      y: {
        grid: { color: '#F0E4D7' },
        ticks: { color: '#A07858', font: { family: 'Nunito' } }
      }
    }
  };

  const doughnutData = {
    labels: categoryBreakdown.categories || [],
    datasets: [
      {
        data: categoryBreakdown.counts || [],
        backgroundColor: [
          '#8B5E3C',
          '#C47F5A',
          '#F5C97A',
          '#7DC8A4',
          '#C9A9DD',
          '#EDD5BC'
        ],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#3D2B1F',
          font: { family: 'Nunito', size: 12 },
          boxWidth: 12,
          padding: 14
        }
      }
    },
    cutout: '70%'
  };

  if (loading) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner" />
        <p className="spinner-label">Loading store metrics...</p>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      {/* Top Banner / Welcome */}
      <div style={{
        background: 'linear-gradient(135deg, var(--latte) 0%, var(--peach) 100%)',
        borderRadius: 'var(--radius-2xl)',
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        border: '1.5px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="flex items-center gap-3">
          <img
            src={dashboardIllustration}
            alt=""
            aria-hidden="true"
            style={{ width: '150px', height: 'auto', flexShrink: 0 }}
          />
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark-roast)', marginBottom: '0.2rem' }}>
              Welcome back to StockSmart!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Review sales, stock levels, and product activity in one place.
            </p>
          </div>
        </div>

        <button 
          onClick={fetchDashboardData}
          className="btn btn-primary"
        >
          <i className="bi bi-arrow-clockwise"></i> Refresh Data
        </button>
      </div>

      {error && <div className="info-box info-danger mb-3" role="alert">{error}</div>}

      {/* KPI Stats Grid */}
      <div className="grid-cols-4 mb-4">
        <StatCard
          title="TOTAL SKUS"
          value={kpis.total_products}
          icon="bi-box-seam-fill"
          theme="espresso"
          subtitle="Catalog entries"
        />
        <StatCard
          title="INVENTORY ON HAND"
          value={Number(kpis.total_stock_units).toLocaleString()}
          icon="bi-layers-fill"
          theme="honey"
          subtitle="Total units in stores"
        />
        <StatCard
          title="TOTAL ASSET VALUE"
          value={`₹${(Number(kpis.total_inventory_value) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon="bi-cash-coin"
          theme="mint"
          subtitle="Wholesale inventory value"
        />
        <StatCard
          title="LOW / OUT OF STOCK"
          value={Number(kpis.low_stock_items) + Number(kpis.out_of_stock_items)}
          icon="bi-exclamation-circle-fill"
          theme="rose"
          subtitle={`${kpis.out_of_stock_items || 0} depleted, ${kpis.low_stock_items || 0} low`}
          trendType="down"
        />
      </div>

      {/* Charts Section */}
      <div className="grid-cols-3 mb-4" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="card">
          <div className="card-header">
            <div>
              <span className="section-label">Revenue Stream</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Sales Trend History</h3>
            </div>
            <span className="badge badge-mocha">Live Performance</span>
          </div>
          <div className="card-body">
            <div className="chart-wrapper">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <span className="section-label">Product Mix</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Categories</h3>
            </div>
          </div>
          <div className="card-body">
            <div className="chart-wrapper" style={{ height: '240px' }}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Reorder Suggestions & Action List */}
      <div className="card">
        <div className="card-header">
          <div>
            <span className="section-label">Smart Forecast</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              Urgent Reorder Recommendations
            </h3>
          </div>
          <Badge variant="warning">
            {reorders.length} Items Flagged
          </Badge>
        </div>
        <div className="card-body p-0">
          {reorders.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">✨</span>
              <div className="empty-title">All Stocks Healthy!</div>
              <p className="empty-subtitle">
                No items are currently below minimum safety stock levels.
              </p>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product & SKU</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Reorder Point</th>
                    <th>Suggested Batch</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {reorders.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{item.product_name || item.name}</strong>
                        <div className="text-muted text-sm">{item.sku || 'SKU-N/A'}</div>
                      </td>
                      <td>{item.category || 'General'}</td>
                      <td>
                        <span className="num-highlight" style={{ color: item.current_stock === 0 ? 'var(--rose)' : 'inherit' }}>
                          {item.current_stock || 0}
                        </span>
                      </td>
                      <td>{item.reorder_point || 10}</td>
                      <td>
                        <span className="badge badge-mocha">
                          +{item.suggested_order_qty || 25} units
                        </span>
                      </td>
                      <td>
                        <Badge variant={item.current_stock === 0 ? 'danger' : 'warning'}>
                          {item.current_stock === 0 ? 'Critically Out' : 'Restock Soon'}
                        </Badge>
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
