import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneOff, Video } from 'lucide-react';

const VideoCall = () => {
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
      {/* Simulation Screen */}
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '320px',
          padding: 0,
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=60"
          alt="Video feed"
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
        />
        <div style={{ position: 'absolute', top: '16px', left: '16px', fontSize: '13px', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '4px' }}>
          Sarah Connor (SECURE LINK)
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
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

export default VideoCall;
