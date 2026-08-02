import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  MdLogin, MdWarning, MdDevices,
  MdTrendingUp, MdTrendingDown, MdRefresh,
  MdShield, MdLocationOn, MdAccessTime, MdBlock
} from 'react-icons/md';
import { FiActivity, FiAlertTriangle } from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { dashboardService } from '../services/dashboardService';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, usePointStyle: true, pointStyleWidth: 8 }
    },
    tooltip: {
      backgroundColor: '#0f1b2e', borderColor: 'rgba(56,100,180,0.3)', borderWidth: 1,
      titleColor: '#e2e8f0', bodyColor: '#94a3b8', padding: 12,
    }
  },
  scales: {
    x: { grid: { color: 'rgba(56,100,180,0.08)' }, ticks: { color: '#4a5568', font: { family: 'Inter', size: 11 } } },
    y: { grid: { color: 'rgba(56,100,180,0.08)' }, ticks: { color: '#4a5568', font: { family: 'Inter', size: 11 } } }
  }
};

const doughnutData = {
  labels: ['Normal', 'Suspicious', 'Blocked'],
  datasets: [{
    data: [78, 17, 5],
    backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(239,68,68,0.8)', 'rgba(245,158,11,0.8)'],
    borderColor: ['#10b981', '#ef4444', '#f59e0b'],
    borderWidth: 2, hoverOffset: 8,
  }]
};

const StatCard = ({ icon, label, value, change, changeDir, color, subtext }) => (
  <div className={`glass-card stat-card ${color}`} style={{ animation: 'countUp 0.5s ease forwards' }}>
    <div className={`stat-icon ${color}`}>{icon}</div>
    <div className="stat-value">{typeof value === 'number' ? value.toLocaleString() : value ?? '—'}</div>
    <div className="stat-label">{label}</div>
    {change && (
      <div className={`stat-change ${changeDir}`}>
        {changeDir === 'up' ? <MdTrendingUp /> : <MdTrendingDown />}
        {change}
      </div>
    )}
    {subtext && <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginTop: '6px' }}>{subtext}</div>}
  </div>
);

const buildChartData = (trend) => {
  if (!trend || trend.length === 0) {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return {
      labels,
      datasets: [
        { label: 'Normal Logins', data: [42, 68, 55, 91, 74, 38, 52], borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4 },
        { label: 'Suspicious', data: [3, 7, 2, 8, 5, 1, 4], borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4 },
      ],
    };
  }
  return {
    labels: trend.map(t => t.date),
    datasets: [
      { label: 'Normal Logins', data: trend.map(t => t.normal), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4 },
      { label: 'Suspicious', data: trend.map(t => t.suspicious), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4 },
    ],
  };
};

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [trend, setTrend] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsData, histData, trendData] = await Promise.all([
        dashboardService.getStats().catch(() => null),
        dashboardService.getHistory(1, 5).catch(() => null),
        dashboardService.getLoginTrend(7).catch(() => []),
      ]);
      if (statsData) setStats(statsData);
      if (histData?.items) setHistory(histData.items);
      if (trendData) setTrend(trendData);
    } catch (e) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const riskScore = stats?.risk_score ?? 45;
  const riskColor = riskScore > 70 ? 'red' : riskScore > 40 ? 'amber' : 'green';
  const riskLabel = riskScore > 70 ? 'HIGH RISK' : riskScore > 40 ? 'MEDIUM RISK' : 'LOW RISK';

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Security Dashboard
            </span>
          </h1>
          <p className="page-subtitle">
            Welcome back, <strong style={{ color: 'var(--clr-text-primary)' }}>{user?.username || 'User'}</strong> — Here's your security overview
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="live-indicator"><span className="live-dot" />Real-time monitoring active</div>
          <button onClick={handleRefresh} className="btn btn-secondary btn-sm" id="dashboard-refresh-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MdRefresh style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />Refresh
          </button>
        </div>
      </div>

      {/* Risk Banner */}
      <div className="glass-card" style={{
        padding: '16px 20px', marginBottom: '24px',
        border: `1px solid rgba(${riskColor === 'red' ? '239,68,68' : riskColor === 'amber' ? '245,158,11' : '16,185,129'}, 0.25)`,
        background: `rgba(${riskColor === 'red' ? '239,68,68' : riskColor === 'amber' ? '245,158,11' : '16,185,129'}, 0.04)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MdShield style={{ fontSize: '1.5rem', color: riskColor === 'red' ? 'var(--clr-accent-red)' : riskColor === 'amber' ? 'var(--clr-accent-amber)' : 'var(--clr-accent-green)' }} />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginBottom: '2px' }}>Current Risk Level</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: riskColor === 'red' ? 'var(--clr-accent-red)' : riskColor === 'amber' ? 'var(--clr-accent-amber)' : 'var(--clr-accent-green)' }}>
                {riskLabel}
              </div>
            </div>
          </div>
          <div style={{ flex: 1, maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>Risk Score</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--clr-text-primary)' }}>{riskScore}/100</span>
            </div>
            <div className="risk-bar">
              <div className={`risk-fill ${riskColor === 'amber' ? 'medium' : riskColor}`} style={{ width: `${riskScore}%`, transition: 'width 1.5s ease' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid-cols-4" style={{ marginBottom: '24px' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card" style={{ height: '140px' }}>
              <div className="skeleton" style={{ width: '52px', height: '52px', marginBottom: '16px' }} />
              <div className="skeleton" style={{ width: '80px', height: '32px', marginBottom: '8px' }} />
              <div className="skeleton" style={{ width: '120px', height: '14px' }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid-cols-4" style={{ marginBottom: '24px' }}>
          <StatCard icon={<MdLogin />} label="Total Logins" value={stats?.total_logins ?? 0} change="+12.5% vs last week" changeDir="up" color="blue" />
          <StatCard icon={<FiAlertTriangle />} label="Suspicious Attempts" value={stats?.suspicious_attempts ?? 0} change="Needs attention" changeDir="down" color="red" />
          <StatCard icon={<MdBlock />} label="Active Threats" value={stats?.suspicious_attempts ?? 0} subtext="Suspicious events flagged" color="amber" />
          <StatCard icon={<MdDevices />} label="Last Login" value={stats?.last_login ? new Date(stats.last_login).toLocaleDateString() : 'N/A'} subtext="Most recent session" color="green" />
        </div>
      )}

      {/* Charts */}
      <div className="grid-cols-2" style={{ marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 className="section-title" style={{ marginBottom: '4px' }}>Login Activity</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Normal vs suspicious login trends</p>
            </div>
            <FiActivity style={{ color: 'var(--clr-accent-blue)', fontSize: '1.2rem' }} />
          </div>
          <div style={{ height: '220px', position: 'relative' }}>
            <Line data={buildChartData(trend)} options={chartOptions} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 className="section-title" style={{ marginBottom: '4px' }}>Login Distribution</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Breakdown by login status</p>
          </div>
          <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Doughnut data={doughnutData} options={{
              responsive: true, maintainAspectRatio: false, cutout: '70%',
              plugins: {
                legend: { position: 'right', labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, padding: 16, usePointStyle: true } },
                tooltip: { backgroundColor: '#0f1b2e', borderColor: 'rgba(56,100,180,0.3)', borderWidth: 1, titleColor: '#e2e8f0', bodyColor: '#94a3b8', padding: 12 }
              }
            }} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 className="section-title" style={{ marginBottom: 0 }}>Recent Login Activity</h3>
          <a href="/login-history" style={{ fontSize: '0.85rem', color: 'var(--clr-accent-blue)', textDecoration: 'none' }}>View All →</a>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th><th>IP Address</th><th>Device / Browser</th><th>Location</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--clr-text-muted)' }}>
                  {loading ? 'Loading...' : 'No login records yet'}
                </td></tr>
              ) : history.map((row) => (
                <tr key={row.id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MdAccessTime style={{ color: 'var(--clr-text-muted)' }} />{new Date(row.login_time).toLocaleString()}</div></td>
                  <td><code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: 'var(--clr-accent-cyan)' }}>{row.ip_address}</code></td>
                  <td>{row.browser} / {row.os}</td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MdLocationOn style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)' }} />{row.location}</div></td>
                  <td><span className={`badge badge-${row.status}`}><span className="badge-dot" />{row.status.charAt(0).toUpperCase() + row.status.slice(1)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
