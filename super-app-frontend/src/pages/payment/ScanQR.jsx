import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaymentStore } from '../../store/paymentStore';
import { useNotification } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import { ArrowLeft, Camera, ShieldAlert } from 'lucide-react';

const ScanQR = () => {
  const [loading, setLoading] = useState(false);
  const { receiveMoney } = usePaymentStore();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleSimulateScan = () => {
    setLoading(true);
    setTimeout(async () => {
      const res = await receiveMoney('Sarah Connor', 450.00);
      setLoading(false);
      if (res.success) {
        addToast('QR Code Decrypted! Received $450.00 from Sarah Connor!', 'success');
        navigate('/payment');
      }
    }, 1500);
  };

  if (loading) return <Loader message="Decrypting scanned digital invoice block..." />;

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

      <div className="glass-card" style={{ maxWidth: '440px', margin: '0 auto', textAlign: 'center', padding: '40px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Scan QR Code Invoice</h3>
        <p style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))', marginBottom: '24px' }}>
          Point camera viewfinder at QR scope to clear funds.
        </p>

        {/* Viewfinder simulator */}
        <div
          style={{
            width: '240px',
            height: '240px',
            border: '2px dashed hsl(var(--accent-cyan))',
            borderRadius: '24px',
            margin: '0 auto 28px auto',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 240, 255, 0.01)',
            boxShadow: 'inset 0 0 20px rgba(0, 240, 255, 0.05)'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              borderTop: '4px solid hsl(var(--accent-cyan))',
              borderLeft: '4px solid hsl(var(--accent-cyan))',
              width: '24px',
              height: '24px',
              borderRadius: '6px 0 0 0'
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              borderTop: '4px solid hsl(var(--accent-cyan))',
              borderRight: '4px solid hsl(var(--accent-cyan))',
              width: '24px',
              height: '24px',
              borderRadius: '0 6px 0 0'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              borderBottom: '4px solid hsl(var(--accent-cyan))',
              borderLeft: '4px solid hsl(var(--accent-cyan))',
              width: '24px',
              height: '24px',
              borderRadius: '0 0 0 6px'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              borderBottom: '4px solid hsl(var(--accent-cyan))',
              borderRight: '4px solid hsl(var(--accent-cyan))',
              width: '24px',
              height: '24px',
              borderRadius: '0 0 6px 0'
            }}
          />
          
          <Camera size={36} color="hsl(var(--accent-cyan))" style={{ opacity: 0.6 }} />
        </div>

        <button onClick={handleSimulateScan} className="btn btn-primary" style={{ width: '100%' }}>
          Simulate Scanning
        </button>
      </div>
    </div>
  );
};

export default ScanQR;
