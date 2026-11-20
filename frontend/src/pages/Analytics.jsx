import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  normalizeAnalyticsKpis,
  normalizeCategoryBreakdown,
  normalizeSalesTrend,
  normalizeTopProducts
} from '../api/analytics';
import StatCard from '../components/StatCard';
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
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({});
  const [salesTrend, setSalesTrend] = useState({ dates: [], totals: [] });
  const [catBreakdown, setCatBreakdown] = useState({ categories: [], counts: [] });
  const [topProducts, setTopProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');
      const [kpiRes, salesRes, catRes, topRes] = await Promise.allSettled([
        api.get('/analytics/kpis/'),
        api.get('/analytics/sales-trend/'),
        api.get('/analytics/category-breakdown/'),
        api.get('/analytics/top-products/')
      ]);

      if (kpiRes.status === 'fulfilled') {
        setKpis(normalizeAnalyticsKpis(kpiRes.value.data));
      } else {
        console.error('Failed to load analytics KPIs:', kpiRes.reason);
      }
      if (salesRes.status === 'fulfilled') {
        setSalesTrend(normalizeSalesTrend(salesRes.value.data));
      } else {
        console.error('Failed to load analytics sales trend:', salesRes.reason);
      }
      if (catRes.status === 'fulfilled') {
        setCatBreakdown(normalizeCategoryBreakdown(catRes.value.data));
      } else {
        console.error('Failed to load analytics category breakdown:', catRes.reason);
      }
      if (topRes.status === 'fulfilled') {
        setTopProducts(normalizeTopProducts(topRes.value.data));
      } else {
        console.error('Failed to load top products:', topRes.reason);
      }

      if ([kpiRes, salesRes, catRes, topRes].some((result) => result.status === 'rejected')) {
        setError('Some analytics data could not be loaded. Refresh to try again.');
      }
    } catch (err) {
      console.error('Analytics load error', err);
      setError('Analytics data could not be loaded. Refresh to try again.');
    } finally {
      setLoading(false);
    }
  };

  const salesChartData = {
    labels: salesTrend.dates || [],
    datasets: [
      {
        label: 'Gross Revenue (INR)',
        data: salesTrend.totals || [],
        backgroundColor: '#8B5E3C',
        borderRadius: 8
      }
    ]
  };

  const catDoughnutData = {
    labels: catBreakdown.categories || [],
    datasets: [
      {
        data: catBreakdown.counts || [],
        backgroundColor: ['#8B5E3C', '#C47F5A', '#F5C97A', '#7DC8A4', '#C9A9DD']
      }
    ]
  };

  if (loading) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner" />
        <p className="spinner-label">Crunching retail numbers...</p>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Analytics & Deep Insights</h1>
          <p className="text-muted text-sm">
            Revenue velocity, top turnover SKUs, and inventory carrying cost
          </p>
        </div>
        <div className="page-header-right">
          <button onClick={fetchAnalyticsData} className="btn btn-primary">
            <i className="bi bi-arrow-clockwise"></i> Refresh Stats
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {error && <div className="info-box info-danger mb-3" role="alert">{error}</div>}

      <div className="grid-cols-3 mb-4">
        <StatCard
          title="TOTAL SALES REVENUE"
          value={`₹${(Number(kpis.total_revenue) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon="bi-graph-up-arrow"
          theme="espresso"
        />
        <StatCard
          title="ACTIVE CATALOG VARIATIONS"
          value={kpis.total_products}
          icon="bi-box-seam"
          theme="honey"
          subtitle="Monitored in system"
        />
        <StatCard
          title="LOW STOCK WARNINGS"
          value={kpis.low_stock_items}
          icon="bi-exclamation-triangle"
          theme="rose"
          subtitle="Buffer attention needed"
          trendType="down"
        />
      </div>

      {/* Graphs */}
      <div className="grid-cols-2 mb-4">
        <div className="card">
          <div className="card-header">
            <div>
              <span className="section-label">Volume</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Daily Sales Volume</h3>
            </div>
          </div>
          <div className="card-body">
            <div className="chart-wrapper">
              <Bar
                data={salesChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { display: false }, ticks: { color: '#A07858' } },
                    y: { grid: { color: '#F0E4D7' }, ticks: { color: '#A07858' } }
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <span className="section-label">Categorization</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Catalog Distribution</h3>
            </div>
          </div>
          <div className="card-body">
            <div className="chart-wrapper">
              <Doughnut
                data={catDoughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#3D2B1F', font: { family: 'Nunito' } }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing SKUs */}
      <div className="card">
        <div className="card-header">
          <div>
            <span className="section-label">Turnover</span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Top Selling Products</h3>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Quantity Sold</th>
                  <th>Gross Revenue</th>
                  <th>Stock Health</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--dark-roast)' }}>{p.name || p.product_name}</div>
                    </td>
                    <td><span className="mono">{p.sku}</span></td>
                    <td><strong>{p.sold || p.total_quantity || 0} units</strong></td>
                    <td>
                      <span className="num-highlight">
                        ₹{Number(p.revenue || p.total_sales || 0).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success">Top Performer</span>
                    </td>
                  </tr>
                ))}
                {topProducts.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>
                      No sales data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
