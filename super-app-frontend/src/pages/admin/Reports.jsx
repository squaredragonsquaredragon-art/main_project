import React, { useEffect } from 'react';
import { useSecurityStore } from '../../store/securityStore';
import Loader from '../../components/common/Loader';
import { TrendingUp, AlertOctagon, CheckSquare } from 'lucide-react';

const Reports = () => {
  const { adminStats, fetchAdminStats, loading } = useSecurityStore();

  useEffect(() => {
    fetchAdminStats();
  }, [fetchAdminStats]);

  if (loading && !adminStats) {
    return <Loader message="Compiling cybernetic threat reports..." />;
  }

  // Mock telemetry trend numbers
  const telemetryData = [
    { day: 'Mon', logins: 120, threats: 2 },
    { day: 'Tue', logins: 154, threats: 4 },
    { day: 'Wed', logins: 98, threats: 1 },
    { day: 'Thu', logins: 220, threats: 12 },
    { day: 'Fri', logins: 180, threats: 3 },
    { day: 'Sat', logins: 85, threats: 0 },
    { day: 'Sun', logins: 95, threats: 1 }
  ];

  const maxLogins = Math.max(...telemetryData.map(d => d.logins));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Sentinel AI Telemetry Reports</h1>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '14px', marginTop: '4px' }}>
          Statistical deviation charts showing daily user actions and ML threat metrics.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Neon HUD Telemetry chart */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="hsl(var(--accent-cyan))" />
            Weekly Anomaly Deviation Matrix
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Visual Bars Container */}
            <div
              style={{
                display: 'flex',
                height: '240px',
                alignItems: 'flex-end',
                justifyContent: 'space-around',
                paddingTop: '20px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                position: 'relative'
              }}
            >
              {telemetryData.map((data, idx) => {
                const loginHeight = (data.logins / maxLogins) * 180;
                const threatHeight = (data.threats / maxLogins) * 180;

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      flex: 1,
                      maxWidth: '50px',
                      position: 'relative'
                    }}
                  >
                    {/* Logins Bar */}
                    <div
                      style={{
                        width: '12px',
                        height: `${Math.max(10, loginHeight)}px`,
                        background: 'linear-gradient(to top, hsl(var(--accent-cyan)), hsl(var(--accent-blue)))',
                        borderRadius: '4px 4px 0 0',
                        boxShadow: 'var(--neon-glow-cyan)',
                        transition: 'all 0.5s ease-out'
                      }}
                      title={`${data.logins} standard logins`}
                    />

                    {/* Threats Bar (Red glow if greater than 0) */}
                    {data.threats > 0 && (
                      <div
                        style={{
                          width: '6px',
                          height: `${Math.max(5, threatHeight)}px`,
                          background: 'linear-gradient(to top, hsl(var(--accent-red)), #b3003b)',
                          borderRadius: '2px 2px 0 0',
                          boxShadow: 'var(--neon-glow-red)',
                          position: 'absolute',
                          bottom: '24px',
                          marginLeft: '14px',
                          transition: 'all 0.5s ease-out'
                        }}
                        title={`${data.threats} quarantined anomalies`}
                      />
                    )}

                    <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>
                      {data.day}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend markers */}
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'hsl(var(--accent-cyan))' }} />
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Analyzed Network Sessions</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'hsl(var(--accent-red))' }} />
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Flagged ML Anomalies</span>
              </div>
            </div>
          </div>
        </div>

        {/* Threat audit parameters summary */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>Threat Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div
              style={{
                padding: '12px',
                borderRadius: 'var(--border-radius-sm)',
                background: 'rgba(255,0,85,0.02)',
                border: '1px solid rgba(255,0,85,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <AlertOctagon color="hsl(var(--accent-red))" size={16} />
              <div>
                <strong>Critical Scans Ratio:</strong>
                <div style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>
                  {adminStats?.total_suspicious || 0} flagged vector sets
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: 'var(--border-radius-sm)',
                background: 'rgba(0,230,118,0.02)',
                border: '1px solid rgba(0,230,118,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <CheckSquare color="hsl(var(--accent-green))" size={16} />
              <div>
                <strong>Verified User Profiles:</strong>
                <div style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>
                  {adminStats?.active_users || 0} secured credentials active
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
