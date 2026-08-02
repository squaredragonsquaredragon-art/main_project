import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaymentStore } from '../../store/paymentStore';
import { useNotification } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import { ArrowLeft, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const SendMoney = () => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const { balance, sendMoney, loading } = usePaymentStore();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!recipient || !amount) return;

    if (parseFloat(amount) <= 0) {
      addToast('Please enter an amount greater than 0.', 'warning');
      return;
    }

    const res = await sendMoney(recipient, amount, desc);
    if (res.success) {
      addToast(`Successfully transferred ${formatCurrency(amount)} to ${recipient}!`, 'success');
      navigate('/payment');
    } else {
      addToast(res.error, 'error');
    }
  };

  if (loading) return <Loader message="Quorum consensus processing transaction block..." />;

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

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Form Card */}
        <form onSubmit={handleSend} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowUpRight size={18} color="hsl(var(--accent-red))" />
            Transfer Capital Out
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>
              Recipient access node name
            </label>
            <input
              type="text"
              className="glass-input"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="sarah_c / john_doe"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div className="flex-between">
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>
                Transfer Volume (USD)
              </label>
              <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>
                Available balance: <strong>{formatCurrency(balance)}</strong>
              </span>
            </div>
            <input
              type="number"
              className="glass-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>
              Ledger message memo
            </label>
            <input
              type="text"
              className="glass-input"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Tactical windbreaker bomber"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            <ShieldCheck size={16} />
            Authorize Transfer Block
          </button>
        </form>

        {/* Security warning side-card */}
        <div
          className="glass-panel"
          style={{
            borderRadius: 'var(--border-radius-md)',
            padding: '24px',
            background: 'rgba(255, 0, 85, 0.01)',
            border: '1px solid rgba(255, 0, 85, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '16px' }}>Ledger Auditing Policies</h3>
          <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', lineHeight: 1.6, margin: 0 }}>
            Transfers are instantly indexed in the Sentinel AI Crypto Audit log. Quarantined accounts cannot transmit assets. Transactions above $10,000 trigger biometric security sentinel holds.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SendMoney;
