import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ArrowLeft, QrCode } from 'lucide-react';

const ReceiveMoney = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <button
        onClick={() => navigate('/payment')}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'hsl(var(--text-secondary))',
          fontWeight: 600,
          width: 'fit-content'
        }}
      >
        <ArrowLeft size={16} />
        Return to Wallet
      </button>

      <div className="glass-card" style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center', padding: '40px 32px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Secure Inward Payment QR</h3>
        <p style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))', marginBottom: '24px' }}>
          Have counterparty scan this node key to clear transfers.
        </p>

        {/* Mock QR Screen */}
        <div
          style={{
            width: '200px',
            height: '200px',
            background: '#fff',
            borderRadius: '16px',
            margin: '0 auto 24px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxShadow: '0 8px 30px rgba(0, 240, 255, 0.1)',
            border: '4px solid hsl(var(--accent-cyan))'
          }}
        >
          <QrCode size={160} color="#000" />
        </div>

        <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
          node_address://{user?.username}
        </div>
      </div>
    </div>
  );
};

export default ReceiveMoney;
