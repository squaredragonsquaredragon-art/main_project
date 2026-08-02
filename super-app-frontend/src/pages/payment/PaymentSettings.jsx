import React from 'react';
import { Settings } from 'lucide-react';

const PaymentSettings = () => {
  return (
    <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
      <Settings size={48} color="hsl(var(--accent-cyan))" style={{ display: 'block', margin: '0 auto 16px auto' }} />
      <h2>Ledger Settings</h2>
      <p style={{ color: 'hsl(var(--text-secondary))', maxWidth: '400px', margin: '8px auto 0 auto', fontSize: '13px' }}>
        Configure smart wallets defaults, modify automatic biometric clearance checks, and link standard payment channels.
      </p>
    </div>
  );
};

export default PaymentSettings;
