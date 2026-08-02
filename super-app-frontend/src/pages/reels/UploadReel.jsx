import React from 'react';
import { Upload } from 'lucide-react';

const UploadReel = () => {
  return (
    <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
      <Upload size={48} color="hsl(var(--accent-purple))" style={{ display: 'block', margin: '0 auto 16px auto' }} />
      <h2>Upload Short video</h2>
      <p style={{ color: 'hsl(var(--text-secondary))', maxWidth: '400px', margin: '8px auto 0 auto', fontSize: '13px' }}>
        Record or upload custom short video streams to share with the Sentinel AI community.
      </p>
    </div>
  );
};

export default UploadReel;
