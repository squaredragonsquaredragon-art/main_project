import React, { useState } from 'react';
import { Ban, ShieldAlert, Plus, Trash2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const BlockedIPs = () => {
  const [bannedIPs, setBannedIPs] = useState([
    { ip: '185.220.101.5', reason: 'Repeated Brute-Force Password attempts', date: '2026-05-24T10:15:00Z', count: 42 },
    { ip: '45.146.164.12', reason: 'Tor Exit Node malicious credentials scans', date: '2026-05-23T16:40:00Z', count: 18 },
    { ip: '198.51.100.72', reason: 'Credential Stuffing bots', date: '2026-05-22T08:12:00Z', count: 120 }
  ]);
  const [newIp, setNewIp] = useState('');
  const [newReason, setNewReason] = useState('');
  const { addToast } = useNotification();

  const handleAddBlock = (e) => {
    e.preventDefault();
    if (!newIp) return;
    
    // validate simple IP regex
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(newIp)) {
      addToast('Please enter a valid IP address format.', 'warning');
      return;
    }

    setBannedIPs(prev => [
      { ip: newIp, reason: newReason || 'Manual Admin Quarantine', date: new Date().toISOString(), count: 0 },
      ...prev
    ]);
    setNewIp('');
    setNewReason('');
    addToast(`IP Host ${newIp} quarantined by security firewall rules.`, 'success');
  };

  const handleReleaseBlock = (ip) => {
    setBannedIPs(prev => prev.filter(item => item.ip !== ip));
    addToast(`Firewall ban lifted for host ${ip}.`, 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Firewall Blocklist Controls</h1>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '14px', marginTop: '4px' }}>
          Instantly ban malicious network scopes, release blocklisted hosts, and override quarantine metrics.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Ban Form */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '16px', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ban size={18} color="hsl(var(--accent-red))" />
            Add Quarantine Rule
          </h3>
          <form onSubmit={handleAddBlock} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Target IP address</label>
              <input
                type="text"
                className="glass-input"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                placeholder="192.168.1.10"
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Reason for block</label>
              <input
                type="text"
                className="glass-input"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="Malicious credential scans"
              />
            </div>
            <button type="submit" className="btn btn-danger" style={{ width: '100%' }}>
              <Plus size={14} />
              Quarantine Scope
            </button>
          </form>
        </div>

        {/* Ban List */}
        <div className="glass-card">
          <h3 style={{ fontSize: '16px', margin: '0 0 16px 0' }}>Banned Host Metrics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {bannedIPs.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: 'var(--border-radius-sm)',
                  background: 'rgba(255, 0, 85, 0.01)',
                  border: '1px solid rgba(255, 0, 85, 0.08)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ShieldAlert size={16} color="hsl(var(--accent-red))" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>{item.ip}</span>
                    <span style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>{item.reason}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>
                    Blocked {item.count} times
                  </span>
                  <button
                    onClick={() => handleReleaseBlock(item.ip)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'hsl(var(--accent-green))',
                      padding: '6px',
                      borderRadius: 'var(--border-radius-sm)',
                    }}
                    title="Release IP"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockedIPs;
