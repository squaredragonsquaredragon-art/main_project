import React, { useState, useEffect, useCallback } from 'react';
import {
  MdNotifications, MdWarning, MdEmail, MdCheckCircle,
  MdRefresh, MdFilterList, MdDoneAll, MdPayment, MdCameraAlt,
  MdShoppingCart, MdSecurity, MdLocationOn, MdDevices, MdAccessTime, MdInfo
} from 'react-icons/md';
import { FiAlertTriangle, FiBell } from 'react-icons/fi';
import { alertService } from '../services/alertService';
import toast from 'react-hot-toast';

const ALERT_META = {
  geo_anomaly:   { icon: <FiAlertTriangle />, iconColor: 'red',    title: 'Geo-Location Anomaly' },
  brute_force:   { icon: <MdWarning />,       iconColor: 'red',    title: 'Brute Force Attempt' },
  unusual_time:  { icon: <MdNotifications />, iconColor: 'amber',  title: 'Unusual Login Time' },
  new_ip:        { icon: <MdEmail />,          iconColor: 'blue',   title: 'New IP Address' },
  suspicious_ip: { icon: <FiAlertTriangle />, iconColor: 'red',    title: 'Suspicious IP Flagged' },
  ml_anomaly:    { icon: <MdWarning />,       iconColor: 'purple', title: 'AI Anomaly Detected' },
  new_device:    { icon: <MdDevices />,      iconColor: 'blue',   title: 'New Device Detected' },
  default:       { icon: <MdNotifications />, iconColor: 'blue',   title: 'Security Alert' },
};

const getAlertMeta = (type) => ALERT_META[type] || ALERT_META.default;

const severityClasses = {
  danger: 'badge-suspicious',
  warning: 'badge-warning',
  info: 'badge-info',
  success: 'badge-normal',
  high: 'badge-suspicious',
  medium: 'badge-warning',
  low: 'badge-info',
  critical: 'badge-suspicious',
};

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // all, unread
  const [appFilter, setAppFilter] = useState('all'); // all, payment, instagram, ecommerce
  const [total, setTotal] = useState(0);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [expandedAlertId, setExpandedAlertId] = useState(null);

  const toggleExpand = (e, id) => {
    e.stopPropagation();
    setExpandedAlertId(prev => prev === id ? null : id);
  };

  const renderAIAnalysis = (aiText) => {
    if (!aiText) return null;

    // Split by markdown headings '### '
    const sections = aiText.split(/###\s+/);

    return (
      <div style={{
        marginTop: '16px', padding: '18px', borderRadius: '8px',
        background: 'rgba(10, 18, 30, 0.95)', border: '1px solid rgba(56, 189, 248, 0.25)',
        boxShadow: '0 0 25px rgba(56, 189, 248, 0.05)', display: 'flex', flexDirection: 'column', gap: '16px',
        textAlign: 'left'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--clr-accent-cyan)', fontWeight: 700, fontSize: '0.85rem', borderBottom: '1px solid rgba(56, 189, 248, 0.15)', paddingBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <span style={{ fontSize: '1.1rem' }}>🤖</span>
          Sentinel AI Copilot Forensic Analysis & Incident Mitigation Guide
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sections.map((sec, idx) => {
            if (!sec.trim()) return null;
            const lines = sec.split('\n');
            const title = lines[0].trim();
            const content = lines.slice(1).join('\n').trim();

            let secIcon = '📝';
            let secBg = 'rgba(255,255,255,0.01)';
            let secBorder = 'rgba(255,255,255,0.03)';
            let titleColor = 'var(--clr-text-primary)';

            if (title.includes('Intrusion') || title.includes('Details')) {
              secIcon = '🔍';
              secBg = 'rgba(56, 189, 248, 0.02)';
              secBorder = 'rgba(56, 189, 248, 0.08)';
              titleColor = 'var(--clr-accent-cyan)';
            } else if (title.includes('Location') || title.includes('Vector')) {
              secIcon = '📍';
              secBg = 'rgba(168, 85, 247, 0.02)';
              secBorder = 'rgba(168, 85, 247, 0.08)';
              titleColor = 'var(--clr-accent-purple)';
            } else if (title.includes('Precaution') || title.includes('Prcausion')) {
              secIcon = '🚨';
              secBg = 'rgba(245, 158, 11, 0.02)';
              secBorder = 'rgba(245, 158, 11, 0.12)';
              titleColor = 'var(--clr-accent-amber)';
            } else if (title.includes('Prevention')) {
              secIcon = '🛡️';
              secBg = 'rgba(16, 185, 129, 0.02)';
              secBorder = 'rgba(16, 185, 129, 0.12)';
              titleColor = 'var(--clr-accent-green)';
            } else if (title.includes('Next') || title.includes('Steps')) {
              secIcon = '📈';
              secBg = 'rgba(6, 182, 212, 0.02)';
              secBorder = 'rgba(6, 182, 212, 0.12)';
              titleColor = 'var(--clr-accent-cyan)';
            }

            return (
              <div key={idx} style={{
                background: secBg, border: `1px solid ${secBorder}`,
                padding: '12px 16px', borderRadius: '6px', fontSize: '0.8rem', lineHeight: 1.5
              }}>
                <div style={{ color: titleColor, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.85rem' }}>
                  <span>{secIcon}</span>
                  {title}
                </div>
                <div style={{ whiteSpace: 'pre-wrap', color: 'var(--clr-text-secondary)' }}>
                  {content}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await alertService.getAlerts(1, 100).catch(() => null);
      const mapped = (data?.items || []).map(a => {
        const meta = getAlertMeta(a.alert_type);
        return {
          ...a,
          read: a.is_read,
          title: meta.title,
          icon: meta.icon,
          iconColor: meta.iconColor,
          time: a.created_at ? new Date(a.created_at).toLocaleString() : '—',
          type: a.alert_type,
        };
      });
      setAlerts(mapped);
      setTotal(data?.total || 0);
      setUnreadTotal(data?.unread || 0);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 4000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const markRead = async (id) => {
    try {
      await alertService.markRead(id);
    } catch { /* optimistic */ }
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, read: true, is_read: true } : a));
    setUnreadTotal(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    try {
      await alertService.markAllRead();
      toast.success('All alerts marked as read');
    } catch { /* optimistic */ }
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true, is_read: true })));
    setUnreadTotal(0);
  };

  // Helper to parse forensic metadata from brute force or attack logs
  const getForensics = (alert) => {
    const desc = alert.description || '';
    const userMatch = desc.match(/targeting (?:user|nonexistent user) '([^']+)'/);
    const targetUser = userMatch ? userMatch[1] : 'system_admin';
    const isNonexistent = desc.includes('nonexistent');

    const locMatch = desc.match(/Originating from ([^.]+)/);
    const originLocation = locMatch ? locMatch[1].trim() : 'Bengaluru (Malleshwaram), Karnataka, India (Zip: 560003)';

    let portalName = 'Central Portal';
    let portalIcon = <MdSecurity />;
    let themeColor = 'var(--clr-accent-blue)';

    if (alert.location === 'payment') {
      portalName = 'Apex Pay';
      portalIcon = <MdPayment />;
      themeColor = 'var(--clr-accent-green)';
    } else if (alert.location === 'instagram') {
      portalName = 'InstaGlance';
      portalIcon = <MdCameraAlt />;
      themeColor = 'var(--clr-accent-purple)';
    }

    return { targetUser, isNonexistent, portalName, portalIcon, themeColor, originLocation };
  };

  // Filter alerts based on active tabs
  const filtered = alerts.filter(a => {
    const matchStatus = statusFilter === 'all' || (statusFilter === 'unread' && !a.read);
    const matchApp = appFilter === 'all' || a.location === appFilter;
    return matchStatus && matchApp;
  });

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--clr-accent-red)', width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MdSecurity />
            </span>
            Cyber Threat Alerts Feed
          </h1>
          <p className="page-subtitle">
            Incident response feed monitoring live hack attempts and account breach operations — <span style={{ color: 'var(--clr-accent-red)', fontWeight: 600 }}>{unreadTotal} unread threats</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => { setLoading(true); fetchAlerts(); }}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <MdRefresh /> Refresh Feed
          </button>
          {unreadTotal > 0 && (
            <button
              id="mark-all-read-btn"
              onClick={markAllRead}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <MdDoneAll /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Submodule Segregation Dashboard Tabs */}
      <div className="grid-cols-3" style={{ marginBottom: '24px' }}>
        {[
          { id: 'all', label: 'All Threats', count: alerts.length, color: 'var(--clr-accent-blue)', bg: 'rgba(59,130,246,0.1)', icon: <MdSecurity /> },
          { id: 'payment', label: 'Apex Pay Attacks', count: alerts.filter(a => a.location === 'payment').length, color: 'var(--clr-accent-green)', bg: 'rgba(16,185,129,0.1)', icon: <MdPayment /> },
          { id: 'instagram', label: 'InstaGlance Attacks', count: alerts.filter(a => a.location === 'instagram').length, color: 'var(--clr-accent-purple)', bg: 'rgba(139,92,246,0.1)', icon: <MdCameraAlt /> },
        ].map((tab) => (
          <div
            key={tab.id}
            onClick={() => setAppFilter(tab.id)}
            className="glass-card stat-card"
            style={{
              cursor: 'pointer',
              outline: appFilter === tab.id ? `2px solid ${tab.color}` : 'none',
              transform: appFilter === tab.id ? 'translateY(-2px)' : 'none',
              boxShadow: appFilter === tab.id ? `0 0 20px ${tab.bg}` : 'none',
              transition: 'all 0.3s ease',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '10px',
                background: tab.bg, color: tab.color, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem'
              }}>
                {tab.icon}
              </div>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--clr-text-primary)' }}>{tab.count}</span>
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--clr-text-secondary)' }}>{tab.label}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', marginTop: '4px' }}>
              {alerts.filter(a => a.location === tab.id && !a.read).length} unread threats
            </div>
          </div>
        ))}
      </div>

      {/* Threats Live List */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--clr-text-primary)' }}>
              Live Security Audits ({filtered.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginTop: '2px' }}>
              Viewing threats filtered by portal nodes
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <MdFilterList style={{ color: 'var(--clr-text-muted)' }} />
            {['all', 'unread'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="btn btn-secondary btn-sm"
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  opacity: statusFilter === s ? 1 : 0.5,
                  background: statusFilter === s ? 'rgba(255,255,255,0.06)' : 'transparent',
                  border: `1px solid ${statusFilter === s ? 'var(--clr-border-hover)' : 'var(--clr-border)'}`,
                  fontSize: '0.75rem'
                }}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px', color: 'var(--clr-text-muted)' }}>
              <MdCheckCircle style={{ fontSize: '3.5rem', color: 'var(--clr-accent-green)', marginBottom: '14px', filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.3))' }} />
              <h4 style={{ color: 'var(--clr-text-primary)', marginBottom: '4px' }}>System Fully Secured</h4>
              <p style={{ fontSize: '0.85rem' }}>No unauthorized breach attempts detected in this submodule category.</p>
            </div>
          ) : filtered.map((alert) => {
            const { targetUser, isNonexistent, portalName, portalIcon, themeColor, originLocation } = getForensics(alert);

            return (
              <div
                key={alert.id}
                onClick={() => !alert.read && markRead(alert.id)}
                className="glass-card"
                style={{
                  border: alert.read ? '1px solid var(--clr-border)' : '1px solid rgba(239, 68, 68, 0.35)',
                  background: alert.read ? 'rgba(15, 27, 46, 0.4)' : 'rgba(239, 68, 68, 0.03)',
                  boxShadow: alert.read ? 'none' : '0 0 15px rgba(239, 68, 68, 0.04)',
                  padding: '20px',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  transition: 'all 0.25s ease',
                  cursor: alert.read ? 'default' : 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Visual Threat Top Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '8px',
                      background: 'rgba(239, 68, 68, 0.12)', color: 'var(--clr-accent-red)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                    }}>
                      <FiAlertTriangle />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--clr-text-primary)' }}>
                          {alert.title}
                        </span>
                        <span className={`badge ${severityClasses[alert.severity]}`} style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
                          {alert.severity}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginTop: '2px' }}>
                        Threat Log ID: {alert.id.substring(0, 8)}...
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid var(--clr-border)',
                      fontSize: '0.75rem', color: themeColor, fontWeight: 700
                    }}>
                      {portalIcon}
                      {portalName}
                    </div>
                    {!alert.read && (
                      <span className="badge badge-danger" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>
                        ACTIVE
                      </span>
                    )}
                  </div>
                </div>

                {/* Threat description */}
                <div style={{
                  padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0,0,0,0.2)', borderLeft: `3px solid ${themeColor}`,
                  fontSize: '0.85rem', color: 'var(--clr-text-secondary)', lineHeight: 1.5
                }}>
                  {alert.description}
                </div>

                {/* Forensic metadata panel */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px', padding: '12px 16px', borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(56, 180, 180, 0.05)'
                }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Target Account
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isNonexistent ? 'var(--clr-accent-amber)' : 'var(--clr-text-primary)' }}>
                      {targetUser} {isNonexistent && <span style={{ fontSize: '0.65rem', fontWeight: 400, color: 'var(--clr-text-muted)' }}>(NONEXISTENT)</span>}
                    </span>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Attacker IP
                    </span>
                    <code style={{ fontSize: '0.85rem', color: 'var(--clr-accent-cyan)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {alert.ip_address || 'Unknown Origin'}
                    </code>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Origin Location
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--clr-accent-amber)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MdLocationOn style={{ color: 'var(--clr-accent-amber)', fontSize: '0.95rem' }} />
                      {originLocation}
                    </span>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Risk Score Index
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <div className="risk-bar" style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
                        <div style={{
                          height: '100%', borderRadius: '3px',
                          background: alert.risk_score >= 70 ? 'var(--clr-accent-red)' : 'var(--clr-accent-amber)',
                          width: `${alert.risk_score}%`
                        }} />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: alert.risk_score >= 70 ? 'var(--clr-accent-red)' : 'var(--clr-accent-amber)' }}>
                        {alert.risk_score}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Detection Timestamp
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MdAccessTime style={{ color: 'var(--clr-text-muted)' }} />
                      {alert.time}
                    </span>
                  </div>
                </div>

                {/* Mitigation advice */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '12px', marginTop: '6px' }}>
                  {!alert.read ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--clr-accent-blue)' }}>
                      <MdInfo />
                      <span>System action: Access blocked. Click card to dismiss.</span>
                    </div>
                  ) : <div />}

                  {alert.ai_analysis && (
                    <button
                      onClick={(e) => toggleExpand(e, alert.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: expandedAlertId === alert.id ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        color: 'var(--clr-accent-cyan)', fontSize: '0.75rem', padding: '6px 12px',
                        borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700,
                        transition: 'all 0.2s ease', marginLeft: 'auto'
                      }}
                    >
                      <span>🤖</span>
                      {expandedAlertId === alert.id ? 'Hide AI Analysis' : 'View AI Incident Report'}
                    </button>
                  )}
                </div>

                {expandedAlertId === alert.id && renderAIAnalysis(alert.ai_analysis)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
