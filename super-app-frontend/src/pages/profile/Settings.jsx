import React from 'react';
import { ArrowLeft, Sliders } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/profile')}
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
        Return to Profile
      </button>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={18} color="hsl(var(--accent-purple))" />
          Terminal Configurations
        </h3>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '13px', lineHeight: 1.6 }}>
          Configure general frontend layouts, styles themes, sounds metrics, and active notifications.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
          {[
            { label: 'Interactive Haptic Feedbacks', desc: 'Sound ticks on clicking ledger buttons' },
            { label: 'Glassmorphic transparency overlays', desc: 'Load dynamic blurred cards across feed views' },
            { label: 'Push alert warnings broadcasts', desc: 'Broadcast threat warnings directly to this browser tab' }
          ].map((item, idx) => (
            <label
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: 'var(--border-radius-sm)',
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid rgba(255,255,255,0.04)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{item.label}</span>
                <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>{item.desc}</span>
              </div>
              <input
                type="checkbox"
                defaultChecked
                style={{ width: '16px', height: '16px', accentColor: 'hsl(var(--accent-purple))' }}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
