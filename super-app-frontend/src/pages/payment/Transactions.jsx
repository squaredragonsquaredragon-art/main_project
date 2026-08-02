import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaymentStore } from '../../store/paymentStore';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const TransactionsList = () => {
  const { transactions, fetchWalletState } = usePaymentStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWalletState();
  }, [fetchWalletState]);

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

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>Biometric Ledger Ledger History</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {transactions.map((tx) => (
            <div
              key={tx.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                fontSize: '14px',
              }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div
                  style={{
                    display: 'flex',
                    padding: '10px',
                    borderRadius: 'var(--border-radius-sm)',
                    background: tx.type === 'send' ? 'rgba(255, 0, 85, 0.05)' : 'rgba(0, 230, 118, 0.05)',
                  }}
                >
                  {tx.type === 'send' ? (
                    <ArrowUpRight size={16} color="hsl(var(--accent-red))" />
                  ) : (
                    <ArrowDownLeft size={16} color="hsl(var(--accent-green))" />
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontWeight: 700 }}>
                    {tx.type === 'send' ? `Transferred to ${tx.receiver}` : `Received from ${tx.sender}`}
                  </span>
                  <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>
                    ID: {tx.id} • {tx.description || 'Electronic ledger payment'}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: '15px',
                    color: tx.type === 'send' ? 'hsl(var(--accent-red))' : 'hsl(var(--accent-green))',
                  }}
                >
                  {tx.type === 'send' ? '-' : '+'}
                  {formatCurrency(tx.amount)}
                </span>
                <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', marginTop: '2px' }}>
                  {formatDate(tx.date)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransactionsList;
