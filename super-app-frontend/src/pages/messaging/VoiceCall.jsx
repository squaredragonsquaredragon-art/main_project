import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneOff, Mic } from 'lucide-react';

const VoiceCall = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '24px',
        textAlign: 'center'
      }}
    >
      <div
        style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, hsl(var(--accent-cyan)), hsl(var(--accent-blue)))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
          boxShadow: 'var(--neon-glow-cyan)',
          animation: 'floatAnimation 3s infinite'
        }}
      >
        👩‍🎤
      </div>

      <div>
        <h2>Sarah Connor</h2>
        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '13px', marginTop: '4px' }}>Connecting secure VoIP route...</p>
      </div>

      {/* Control buttons */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <button
          className="btn"
          style={{ width: '48px', height: '48px', borderRadius: '50%', padding: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Mic size={18} />
        </button>
        
        <button
          onClick={() => navigate('/messaging')}
          className="btn btn-danger"
          style={{ width: '48px', height: '48px', borderRadius: '50%', padding: 0 }}
        >
          <PhoneOff size={18} />
        </button>
      </div>
    </div>
  );
};

export default VoiceCall;
