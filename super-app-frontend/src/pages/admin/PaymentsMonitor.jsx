import React from 'react';
import { DollarSign, ShieldAlert, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const PaymentsMonitor = () => {
  const paymentLogs = [
    { id: 'tx_9921', user: 'neo_prime', amount: 50000.00, direction: 'out', target: 'Nebula Holdings', risk: 'critical', date: '2026-05-24T17:12:00Z' },
    { id: 'tx_9922', user: 'sarah_c', amount: 240.00, direction: 'out', target: 'Vendor Store', risk: 'low', date: '2026-05-24T16:04:00Z' },
    { id: 'tx_9923', user: 'trinity', amount: 1500.00, direction: 'in', target: 'Acme Corp', risk: 'low', date: '2026-05-24T14:22:00Z' },
    { id: 'tx_9924', user: 'john_doe', amount: 9800.00, direction: 'out', target: 'Apex Crypto Mixer', risk: 'high', date: '2026-05-24T11:45:00Z' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Crypto Transaction Audit</h1>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '14px', marginTop: '4px' }}>
          Real-time payment logs analyzer checking digital transfers for laundering vectors.
        </p>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <th style={{ padding: '16px 20px' }}>Transaction ID</th>
              <th style={{ padding: '16px 20px' }}>User node</th>
              <th style={{ padding: '16px 20px' }}>Transfer Volume</th>
              <th style={{ padding: '16px 20px' }}>Counterparty Node</th>
              <th style={{ padding: '16px 20px' }}>Audit risk</th>
              <th style={{ padding: '16px 20px' }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {paymentLogs.map((tx, idx) => (
              <tr
                key={idx}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <td style={{ padding: '16px 20px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{tx.id}</td>
                <td style={{ padding: '16px 20px' }}>{tx.user}</td>
                <td style={{ padding: '16px 20px', fontWeight: 600 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: tx.direction === 'out' ? 'hsl(var(--accent-red))' : 'hsl(var(--accent-green))' }}>
                    {tx.direction === 'out' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                    {formatCurrency(tx.amount)}
                  </span>
                </td>
                <td style={{ padding: '16px 20px' }}>{tx.target}</td>
                <td style={{ padding: '16px 20px' }}>
                  <span className={`badge badge-${tx.risk === 'critical' || tx.risk === 'high' ? 'danger' : 'success'}`}>
                    {tx.risk}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', color: 'hsl(var(--text-muted))' }}>{formatDate(tx.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsMonitor;
