import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaymentStore } from '../../store/paymentStore';
import Loader from '../../components/common/Loader';
import { ArrowUpRight, ArrowDownLeft, Plus, Wallet, QrCode, CreditCard } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const DigitalWallet = () => {
  const { balance, banks, transactions, fetchWalletState, loading } = usePaymentStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWalletState();
  }, [fetchWalletState]);

  if (loading && transactions.length === 0) {
    return <Loader message="Accessing secure electronic ledger vaults..." size="large" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Wallet Balance Card */}
      <div
        className="glass-card premium animate-float"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '24px',
          alignItems: 'center',
          background: 'linear-gradient(135deg, hsl(var(--bg-secondary) / 0.9) 0%, rgba(189, 0, 255, 0.05) 100%)',
          border: '1px solid rgba(189, 0, 255, 0.15)',
          boxShadow: 'var(--neon-glow-purple)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', fontWeight: 600, letterSpacing: '0.05em' }}>
            APEX DIGITAL CAPITAL
          </span>
          <div style={{ fontSize: '42px', fontWeight: 800, fontFamily: 'var(--font-primary)' }} className="text-gradient-cyan">
            {formatCurrency(balance)}
          </div>
          <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>
            Fully verified biometric crypto-vault active
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/payment/send')}
              className="btn btn-primary"
              style={{ flex: 1, padding: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <ArrowUpRight size={14} />
              Transfer Out
            </button>
            <button
              onClick={() => navigate('/payment/receive')}
              className="btn btn-premium"
              style={{ flex: 1, padding: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <QrCode size={14} />
              Request QR
            </button>
          </div>
          <button
            onClick={() => navigate('/payment/scan')}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            Scan Pay QR
          </button>
        </div>
      </div>

      {/* Grid: Counterparty Bank Nodes & Ledger Logs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Left Panel: Bank Accounts */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} color="hsl(var(--accent-purple))" />
              Settlement Nodes
            </h3>
            <button
              onClick={() => navigate('/payment/banks')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'hsl(var(--accent-purple))',
                display: 'flex',
                padding: '4px',
              }}
            >
              <Plus size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {banks.map((bank) => (
              <div
                key={bank.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--border-radius-sm)',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '20px' }}>{bank.logo}</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px' }}>{bank.name}</span>
                    <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>{bank.accountNo}</span>
                  </div>
                </div>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>{formatCurrency(bank.balance)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Transaction Ledgers */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wallet size={18} color="hsl(var(--accent-cyan))" />
              Electronic Transfer Log
            </h3>
            <button
              onClick={() => navigate('/payment/transactions')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'hsl(var(--accent-cyan))', fontWeight: 600 }}
            >
              Audit All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {transactions.slice(0, 4).map((tx) => (
              <div
                key={tx.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--border-radius-sm)',
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  fontSize: '13px',
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div
                    style={{
                      display: 'flex',
                      padding: '8px',
                      borderRadius: 'var(--border-radius-sm)',
                      background: tx.type === 'send' ? 'rgba(255, 0, 85, 0.05)' : 'rgba(0, 230, 118, 0.05)',
                    }}
                  >
                    {tx.type === 'send' ? (
                      <ArrowUpRight size={14} color="hsl(var(--accent-red))" />
                    ) : (
                      <ArrowDownLeft size={14} color="hsl(var(--accent-green))" />
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700 }}>{tx.type === 'send' ? tx.receiver : tx.sender}</span>
                    <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>{tx.description || 'Ledger transfer'}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontWeight: 700,
                      color: tx.type === 'send' ? 'hsl(var(--accent-red))' : 'hsl(var(--accent-green))',
                    }}
                  >
                    {tx.type === 'send' ? '-' : '+'}
                    {formatCurrency(tx.amount)}
                  </span>
                  <div style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', marginTop: '2px' }}>
                    {formatDate(tx.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalWallet;
