import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 size={18} color="hsl(var(--accent-green))" />;
      case 'error': return <AlertCircle size={18} color="hsl(var(--accent-red))" />;
      case 'warning': return <AlertCircle size={18} color="hsl(var(--accent-orange))" />;
      default: return <Info size={18} color="hsl(var(--accent-cyan))" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success': return 'hsla(var(--accent-green), 0.3)';
      case 'error': return 'hsla(var(--accent-red), 0.3)';
      case 'warning': return 'hsla(var(--accent-orange), 0.3)';
      default: return 'hsla(var(--accent-cyan), 0.3)';
    }
  };

  return (
    <div
      className="glass-panel animate-slide-in-right"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        borderRadius: 'var(--border-radius-sm)',
        borderLeft: `4px solid`,
        borderColor: getBorderColor(),
        minWidth: '280px',
        maxWidth: '400px',
        boxShadow: 'var(--glass-shadow)',
        color: 'hsl(var(--text-primary))',
        justifyContent: 'space-between'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {getIcon()}
        <span style={{ fontSize: '13px', fontWeight: 500 }}>{message}</span>
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          opacity: 0.6,
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6}
      >
        <X size={14} color="currentColor" />
      </button>
    </div>
  );
};

export default Toast;
