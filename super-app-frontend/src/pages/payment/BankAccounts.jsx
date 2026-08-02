import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaymentStore } from '../../store/paymentStore';
import { useNotification } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';

const BankAccounts = () => {
  const [name, setName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [type, setType] = useState('Checking');
  const { addBankAccount, loading } = usePaymentStore();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name || !accountNo) return;

    const res = await addBankAccount({ name, accountNo, type });
    if (res.success) {
      addToast(`Settlement Node Bank ${name} linked successfully!`, 'success');
      navigate('/payment');
    } else {
      addToast(res.error, 'error');
    }
  };

  if (loading) return <Loader message="Quorum consensus matching banking credentials..." />;

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
        <form onSubmit={handleAdd} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} color="hsl(var(--accent-purple))" />
            Link Settlement bank account
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>
              Institution Name
            </label>
            <input
              type="text"
              className="glass-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Apex Sentinel Bank"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>
              Account Number
            </label>
            <input
              type="text"
              className="glass-input"
              value={accountNo}
              onChange={(e) => setAccountNo(e.target.value)}
              placeholder="1234567890"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>
              Account type
            </label>
            <select
              className="glass-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ background: 'hsl(var(--bg-tertiary))' }}
            >
              <option value="Checking">Checking Account</option>
              <option value="Savings">Savings Account</option>
            </select>
          </div>

          <button type="submit" className="btn btn-premium" style={{ width: '100%' }}>
            <ShieldCheck size={16} />
            Authorize Node Link
          </button>
        </form>

        <div
          className="glass-panel"
          style={{
            borderRadius: 'var(--border-radius-md)',
            padding: '24px',
            background: 'rgba(189, 0, 255, 0.01)',
            border: '1px solid rgba(189, 0, 255, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '16px' }}>Clearing consensus</h3>
          <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', lineHeight: 1.6, margin: 0 }}>
            Linking counterparty nodes requires routing standard clearing checks. No physical cards are saved. Digital assets are quarantined if anomalous network attempts trigger bans on user keys.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BankAccounts;
